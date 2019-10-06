# v0.0.4

* Update faas engine to accept appId for client authentication
* update faas to v1.5.0
* change in routes for faas engine
    |Route|Description|
    |-----|-----------|
    |/functions/:name|Run a function available in bfastfaas|
    |/deploy|Used as alternative to deploy functions from git server to faas engine |
All request require to add header to authenticate against a certain application

```shell script
#Example

curl -H"bfast-application-id:<APPLICATION_ID>" https://<PROJECT_ID>_faas.bfast.fahamutech.com/functions/hello
```

# v0.0.3

* update faas to v1.4.10