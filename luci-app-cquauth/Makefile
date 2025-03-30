#
# Copyright (C) 2025 Your Name <your@email.com>
# This is free software, licensed under the Apache License, Version 2.0.
#
include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-cquauth
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_MAINTAINER:=lurenjiamax <lurenjiamax@gmail.com>

LUCI_TITLE:=CQU Auth (Chongqing University Authentication)
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+curl

include $(TOPDIR)/feeds/luci/luci.mk

# POSTINSTALL
define Package/$(PKG_NAME)/postinst
#!/bin/sh
chmod +x /etc/init.d/cquauth_client
chmod +x /usr/bin/cquauth_client
chmod +x /usr/share/rpcd/ucode/cquauth
endef

# call BuildPackage - OpenWrt buildroot signature
