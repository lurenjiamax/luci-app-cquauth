## luci-app-cquauth

An unofficial DRCOM auth client for CQU (Chongqing University).
Currently only support D campus.

### Feature:

- Multiple accounts support
- Multiple interface support (curl)
- Internet connection check with auto relogin (ping)
- Account status check

### Issues:

- UA_Detect: If you use different UA in http traffics, you may be detected as sharing. Please considering using the same UA in all http traffics or disable http traffics.

You will have three ways to pass UA_Detect:
- Modify UA: Check https://blog.sunbk201.site/posts/ua3f/ to start a local UA server.
- Proxy: Use tproxy to redirect all http traffics to a proxy server, see [./http_tproxy.md](http_tproxy.md)
- Forbidden: Just block all frequent http port since http traffics are unsecure.

## Credits

- @haowang02: https://github.com/haowang02/cqu-net-auth
- LUG@CQU
- you