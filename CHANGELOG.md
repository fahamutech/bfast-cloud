# v0.0.5-alpha

* Updae faas engine to use v1.7.0-alpha to improve deployment of functions

* reduce unit memory unit for each service from 256MB to 125MB

# v0.0.4-alpha2

Updae faas engine to use v1.5.0-alpha1

# v0.0.4-alpha1

Update release version to alpha stage.

* Update url structure from `https://${projectId}_COMPONENT.bfast.fahamutech.com` to `https://${projectId}-COMPONENT.bfast.fahamutech.com` for example to `https://demo-daas.bfast.fahamutech.com`. Because in android '_' its invalid character in url.

# v0.0.4-beta1

* Update faas engine to v1.5.0-beta4

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