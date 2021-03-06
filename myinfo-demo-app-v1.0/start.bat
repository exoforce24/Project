@ECHO off
set MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY=./ssl/testapp_private.pem
set MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT=./ssl/stg-auth-signing-public.pem

set MYINFO_APP_CLIENT_ID=MyInfo_SelfTest
set MYINFO_APP_CLIENT_SECRET=password
set MYINFO_APP_REDIRECT_URL=http://localhost:3001/callback
set MYINFO_APP_REALM=http://localhost:3001

rem L0 APIs
set AUTH_LEVEL=L0
set MYINFO_API_AUTHORISE=https://myinfo.api.gov.sg/dev/v1/authorise
set MYINFO_API_TOKEN=https://myinfo.api.gov.sg/dev/v1/token
set MYINFO_API_PERSON=https://myinfo.api.gov.sg/dev/v1/person

rem L2 APIs
rem set AUTH_LEVEL=L2
rem set MYINFO_API_AUTHORISE=https://myinfo.api.gov.sg/test/v1/authorise
rem set MYINFO_API_TOKEN=https://myinfo.api.gov.sg/test/v1/token
rem set MYINFO_API_PERSON=https://myinfo.api.gov.sg/test/v1/person

npm start
                                                                                                                                                                                                                                                           