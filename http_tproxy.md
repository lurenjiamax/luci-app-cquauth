## Tproxy http traffics

#### Nftables
```nft
#!/usr/sbin/nft -f

table inet tproxy_table {
    chain prerouting {
        type filter hook prerouting priority -100; policy accept;
        ip iifname "br-lan" tcp dport { 80, 8080, 7777, 6969, 2710, 1096 } \
            tproxy ip to 127.0.0.1:1088 mark set 1
    }
}

```
Put this file in /etc/nfts/100-tproxy.nft

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

# Set your remote socks5 proxy server like ua3f
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

setup_tproxy() {

    nft delete table inet tproxy_table
    nft -f /etc/nfts/100-tproxy.nft

    if ! grep -q "^100.*tproxy$" /etc/iproute2/rt_tables; then
        echo "100 tproxy" >> /etc/iproute2/rt_tables
    fi

    if ! ip rule show | grep -q "fwmark 1 lookup tproxy"; then
        ip rule add fwmark 1 lookup tproxy
    fi

    if ! ip route show table tproxy | grep -q "local 0.0.0.0/0"; then
        ip route add local 0.0.0.0/0 dev lo table tproxy
    fi
}

cleanup_tproxy() {
    nft delete table inet tproxy_table 2>/dev/null
    ip route del local 0.0.0.0/0 dev lo table tproxy 2>/dev/null
    ip rule del fwmark 1 lookup tproxy 2>/dev/null
}

start_service() {
    setup_tproxy
    procd_open_instance
    procd_set_param command /usr/bin/hev-socks5-tproxy /etc/hevproxy.yml
    procd_set_param respawn
    procd_set_param stdout 1
    procd_set_param stderr 1
    procd_close_instance
}

stop_service() {
    cleanup_tproxy
    killall hev-socks5-tproxy
}         
```