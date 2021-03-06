export MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY=./ssl/testapp_private.pem
export MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT=./ssl/stg-auth-signing-public.pem

export MYINFO_APP_CLIENT_ID=MyInfo_SelfTest
export MYINFO_APP_CLIENT_SECRET=password
export MYINFO_APP_REDIRECT_URL=http://localhost:3001/callback
export MYINFO_APP_REALM=http://localhost:3001

# L0 APIs
export AUTH_LEVEL=L0
export MYINFO_API_AUTHORISE='https://myinfo.api.gov.sg/dev/v1/authorise'
export MYINFO_API_TOKEN='https://myinfo.api.gov.sg/dev/v1/token'
export MYINFO_API_PERSON='https://myinfo.api.gov.sg/dev/v1/person'

# L2 APIs
#export AUTH_LEVEL=L2
#export MYINFO_API_AUTHORISE='https://myinfo.api.gov.sg/test/v1/authorise'
#export MYINFO_API_TOKEN='https://myinfo.api.gov.sg/test/v1/token'
#export MYINFO_API_PERSON='https://myinfo.api.gov.sg/test/v1/person'

npm start
                                                                                                                                                                                                                                                                 