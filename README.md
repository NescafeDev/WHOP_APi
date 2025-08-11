# WHOP API with CORS Configuration

This API is configured to handle CORS (Cross-Origin Resource Sharing) properly for requests from `https://go.kenangraceuniversity.com`.

## CORS Configuration

The API now includes:

1. **Explicit CORS middleware** with allowed origins
2. **Preflight request handling** for OPTIONS requests
3. **Vercel-level CORS headers** in `vercel.json`
4. **Additional middleware** to ensure headers are always present

## Allowed Origins

- `https://go.kenangraceuniversity.com` (your main domain)
- `https://whop-a-pi.vercel.app` (API domain)
- `http://localhost:3000` (local development)
- `http://localhost:8081` (local development)

## Testing CORS

### 1. Use the Test HTML File

Open `test-cors.html` in your browser to test the CORS configuration:

```bash
# Open the file in your browser
open test-cors.html
```

### 2. Test from Command Line

```bash
# Test OPTIONS preflight request
curl -X OPTIONS https://whop-a-pi.vercel.app/api/test-cors \
  -H "Origin: https://go.kenangraceuniversity.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test actual request
curl https://whop-a-pi.vercel.app/api/test-cors \
  -H "Origin: https://go.kenangraceuniversity.com" \
  -v
```

### 3. Test from Your Domain

Add this JavaScript to your website at `https://go.kenangraceuniversity.com`:

```javascript
fetch('https://whop-a-pi.vercel.app/api/test-cors')
  .then(response => response.json())
  .then(data => console.log('CORS test successful:', data))
  .catch(error => console.error('CORS test failed:', error));
```

## Deployment

After making changes:

1. **Commit and push** your changes to your repository
2. **Vercel will automatically deploy** the updates
3. **Test the CORS configuration** using the methods above

## Troubleshooting

If you still encounter CORS issues:

1. **Check the browser console** for specific error messages
2. **Verify the deployment** - ensure your changes are live on Vercel
3. **Check the server logs** - the API now includes debugging information
4. **Test with the HTML file** to isolate whether it's a client or server issue

## API Endpoints

- `GET /` - Hello World
- `GET /api/test-cors` - CORS test endpoint
- `POST /api/lookup-user-from-receipt` - Lookup user from receipt
- `POST /api/charge` - Charge user

All endpoints now properly handle CORS and preflight requests.
