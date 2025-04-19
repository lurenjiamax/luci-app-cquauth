#!/bin/bash

# UA 列表
user_agents=(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15"
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/122.0"
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  "Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"
  "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.30(0x18001e2e) NetType/WIFI Language/zh_CN"
  "Mozilla/5.0 (Linux; U; Android 11; zh-cn; MI 9 Build/RKQ1.200826.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 MQQBrowser/11.9"
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"
  "Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/5.0 TV Safari/537.36"
  "curl/7.64.1"
)

# 目标网址列表
urls=(
  "http://speedtesthkg.fpt.vn:8080"
)

# 主循环：对每个 UA 和每个 URL 发起请求
for ua in "${user_agents[@]}"; do
  for url in "${urls[@]}"; do
    echo "=========================================================="
    echo "User-Agent: $ua"
    echo "Target URL: $url"
    echo "Sending request..."

    # 执行 curl 请求
    curl --user-agent "$ua" \
         --connect-timeout 5 \
         --max-time 10 \
         --interface eth1 \
         -s "$url" | head -n 10  # 只显示前10行响应内容（可修改）

    echo -e "\n⏳ Waiting 5 seconds...\n"
    sleep 1
  done
done
