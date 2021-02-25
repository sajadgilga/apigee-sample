# Nilva Apigee Client

This project is a sample interface to:

- create & define
- deploy
- update
- scale
- monitor
- view logs

apigee proxies for api management of services. You can define your desired api proxy in proxy folder (like nilva-test proxy as a sample), and then by running deploy.js, it is possible to deploy or scale that proxy to your apigee cloud account (or private cloud).

As a sample we have provided you a simple proxy (nilva-test) with below properties:

- secured with api key (you must create api key in your account, but for sample we have provided an example api key below)
- pre flowed with json protection & static collector for further monitoring
- load balanced between target servers with round robin algorithm
- health monitored & health check

**example api key**: Co9jLkVcGsfdXpOc8ita55ZEoZGdTYFd