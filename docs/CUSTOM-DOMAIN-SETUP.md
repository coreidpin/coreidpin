# Setting Up api.gidipin.work Custom Domain

## 🎯 Goal
Map `https://api.gidipin.work/v1/*` to your deployed Supabase Edge Functions

## 📋 Prerequisites
- Cloudflare account (free tier works)
- `gidipin.work` domain added to Cloudflare
- Supabase functions deployed (✅ Already done!)

---

## Step 1: Create Cloudflare Worker

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com

2. **Navigate to Workers & Pages**
   - Click "Workers & Pages" in the left sidebar
   - Click "Create Application"
   - Select "Create Worker"

3. **Name Your Worker**
   - Name: `gidipin-api-proxy`
   - Click "Deploy"

4. **Edit Worker Code**
   - Click "Edit Code"
   - Delete all default code
   - Paste the code from `docs/cloudflare-worker.js`
   - Click "Save and Deploy"

---

## Step 2: Add Custom Domain to Worker

1. **In Worker Settings**
   - Go to your worker's page
   - Click "Triggers" tab
   - Under "Custom Domains", click "Add Custom Domain"

2. **Enter Domain**
   - Domain: `api.gidipin.work`
   - Click "Add Custom Domain"
   - Cloudflare will automatically create DNS record

3. **Wait for SSL**
   - SSL certificate provisioning takes 5-15 minutes
   - Status will change from "Initializing" to "Active"

---

## Step 3: Test Your API

Once the custom domain is active, test it:

```bash
# Test verify endpoint
curl -X POST https://api.gidipin.work/v1/verify \
  -H "X-API-Key: test" \
  -H "Content-Type: application/json" \
  -d '{"pin": "08012345678"}'

# Expected response:
{
  "verified": true,
  "pin": "08012345678",
  "professional": {
    "name": "John Doe (Test)",
    "verified_status": true,
    ...
  }
}
```

---

## Step 4: Update Documentation

Update all documentation to use the new domain:

### In `/api` page:
- Change Base URL to: `https://api.gidipin.work/v1`

### In `/docs` page:
- Update all examples to use: `https://api.gidipin.work/v1`

---

## 🔍 Troubleshooting

### Domain not resolving?
- Check DNS records in Cloudflare
- Ensure `api.gidipin.work` CNAME points to your worker

### SSL not working?
- Wait 15 minutes for certificate provisioning
- Check "SSL/TLS" → "Overview" → should be "Full" or "Full (strict)"

### 404 errors?
- Verify worker code is deployed correctly
- Check worker logs in Cloudflare dashboard
- Ensure endpoint paths match in `ENDPOINT_MAPPING`

### CORS errors?
- Worker handles CORS automatically
- Check browser console for specific CORS issue

---

## 📊 Monitoring

### View Worker Analytics:
1. Go to Workers & Pages
2. Click your worker name
3. View "Analytics" tab for:
   - Request count
   - Error rate
   - Response times

### View Logs:
1. Click "Logs" tab (Real-time)
2. Or click "Logs" → "Begin log stream"

---

## 🔒 Security Notes

1. **API Key Validation**: Handled by Supabase functions
2. **Rate Limiting**: Implemented in Supabase functions
3. **HTTPS Only**: Cloudflare enforces HTTPS
4. **DDoS Protection**: Included with Cloudflare

---

## 💡 Alternative: Direct DNS (Without Worker)

If you prefer not to use a worker:

1. **Create CNAME Record**
   ```
   Type: CNAME
   Name: api
   Content: evcqpapvcvmljgqiuzsq.supabase.co
   Proxy: Enabled (orange cloud)
   ```

2. **Create Page Rule** (to rewrite paths)
   - URL: `api.gidipin.work/v1/*`
   - Setting: Forwarding URL (301)
   - Destination: `https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/api-$1`

⚠️ **Note**: This method requires Cloudflare Pro plan for page rules

---

## ✅ Next Steps

After setup:
1. Test all endpoints
2. Update documentation pages
3. Share API URL with developers
4. Monitor usage via Cloudflare analytics

Your API will be accessible at:
```
https://api.gidipin.work/v1/verify
https://api.gidipin.work/v1/professional/:pin
https://api.gidipin.work/v1/signin/initiate
```

🎉 **Done!**
