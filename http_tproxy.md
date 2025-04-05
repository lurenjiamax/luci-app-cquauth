## Tproxy http traffics

#### Nftables
```nft
#!/usr/sbin/nft -f

table inet tproxy_table {
    chain prerouting {
        type filter hook prerouting priority mangle; policy accept;

        ip iifname "br-lan" tcp dport { 80, 8080, 7777, 6969, 2710, 1096 } \
            tproxy ip to 127.0.0.1:1088 mark set 1
    }
}

```
Set 127.0.0.1:1088 to your local tcp tproxy server.

#### IP
```bash
# Add tproxy table
echo "100 tproxy" >> /etc/iproute2/rt_tables

# Add rule
ip rule add fwmark 1 lookup tproxy

# Add route to indicate related packets as local packets
ip route add local 0.0.0.0/0 dev lo table tproxy
```

#### Tproxy server

If your server does't support tproxy or it is on another machine, you can use this tproxy app:
https://github.com/heiher/hev-socks5-tproxy. Otherwise, please skip this step.

After downloading, put binary to /usr/bin/hev-socks5-tproxy.

Use following conf, put in /etc/hevproxy.yml:

```yaml
main:
  workers: 1

# Set your remote socks5 proxy server
socks5:
  port: 1080
  address: 127.0.0.1
  # Socks5 UDP relay mode (tcp|udp)
  udp: 'udp'
  # Socks5 handshake using pipeline mode
# pipeline: false
  # Socks5 server username
  username: 'username'
  # Socks5 server password
  password: 'password'
  # Socket mark
  mark: 0x438

tcp:
  port: 1088
  address: '::'
```

Test init.d service:
```bash
#!/bin/sh /etc/rc.common

USE_PROCD=1
START=95

start_service() {
    procd_open_instance
    procd_set_param command /usr/bin/hev-socks5-tproxy /etc/hevproxy.yml
    procd_set_param respawn
    procd_set_param stdout 1
    procd_set_param stderr 1
    procd_close_instance
}

stop_service() {
    killall hev-socks5-tproxy
}         
```