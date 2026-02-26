 npx localtunnel --port 3000 --subdomain daccess     // to start the subdomaine
change the EXPO_PUBLIC_API_URL to    =>>   EXPO_PUBLIC_API_URL=https://daccess.loca.lt
and the GOOGLE_CALLBACK_URL  to =>>>    GOOGLE_CALLBACK_URL='https://daccess.loca.lt/auth/google/callback'
  don't forget in the id client OAUTH  "the URI de redirection autorisés" is  =>>>   https://daccess.loca.lt/auth/google/callback