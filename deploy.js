var apigeetool = require('apigeetool');
const path = require('path');
require('dotenv').config();
var sdk = apigeetool.getPromiseSDK();
var fs = require('fs');
const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

var opts = {
	organization: process.env.ORG,
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
	environments: 'prod',
	baseuri: 'https://api.enterprise.apigee.com'
};

const readQuestion = () =>
	readline.question(
		'\
Insert what you want to do! possible options are: \n\
1. deploy proxy: deploy \n\
2. redeploy proxy: redeploy \n\
3. scale proxy: scale \n\
4. monitor logs: logs \n\
5. close deploy helper: close \n\
',
		handleCLI
	);

const deployProxy = (name) => {
	opts.api = name;
	opts.directory = path.join(__dirname, `proxies/${name}`);

	sdk
		.deployProxy(opts)
		.then(
			function(result) {
				console.log(`successfully deployed proxy ${name}:\n`, result);
			},
			function(err) {
				console.log('proxy deployment ended with failure due to:\n', err);
			}
		)
		.done(() => readQuestion());
};

const getLogs = (name) => {
	opts.api = name;

	sdk
		.getLogs(opts)
		.then(
			function(result) {
				console.log(`successfully received logs for api ${name}:\n`, result);
			},
			function(err) {
				console.log('retreiving logs ended with failure due to:\n', err);
			}
		)
		.done(() => readQuestion());
};

const addTargetServer = (name, host, port) => {
	opts.targetServerName = name;
	opts.targetHost = host;
	opts.targetEnabled = true;
	opts.targetPort = port;
	opts.environment = opts.environments;

	sdk.createTargetServer(opts).then(
		function(result) {
			console.log(`successfully created target server ${opts.targetServerName}:\n`, result);
		},
		function(err) {
			console.log('target creation ended with failure due to:\n', err);
		}
	);
};

const scaleApplication = (data) => {
	var [ proxy, endpoint, name, host, port ] = data.split(':');
	const endpointDir = path.join(__dirname, `proxies/${proxy}/apiproxy/targets/${endpoint}.xml`);

	fs.readFile(endpointDir, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		const servers = /<LoadBalancer>([\s\S]*)<\/LoadBalancer>/g.exec(data)[1];
		var result = data.replace(
			/<LoadBalancer>[\s\S]*<\/LoadBalancer>/g,
			`<LoadBalancer>${servers}\n\t\t\t<Server name="${name}" />\n\t\t<\/LoadBalancer>`
		);

		fs.writeFile(endpointDir, result, 'utf8', function(err) {
			if (err) return console.log(err);
			addTargetServer(name, host, port);
			deployProxy(proxy);
		});
	});
};

const handleCLI = (command) => {
	if (command === 'deploy') readline.question('enter proxy name:\n', deployProxy);
	else if (command === 'close') readline.close();
	else if (command === 'logs') readline.question('enter api name:\n', getLogs);
	else if (command === 'redeploy') readline.question('enter proxy name:\n', deployProxy);
	else if (command === 'scale')
		readline.question(
			'enter new target server info: (e.g. proxy-name:target-endpoint-name:target-name:192.168.0.1:3000\n',
			scaleApplication
		);
	else {
		console.log('\nDUDE! What the f* are you typing? wrong command, try again...\n');
		readQuestion();
	}
};

readQuestion();
