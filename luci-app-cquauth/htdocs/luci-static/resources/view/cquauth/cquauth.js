'use strict';
'require form';
'require uci';
'require view';
'require rpc';
'require fs';
'require tools.widgets as widgets';
'require poll';

var callGetStatus = rpc.declare({
    object: 'cquauth',
    method: 'get_status',
    params: ['interface'],
});

var pollAdded = false;

function renderStatus(container, accounts) {
    while (container.childNodes.length > 0) {
        container.removeChild(container.lastChild);
    }

    if (accounts.length === 0) {
        container.appendChild(E('div', { 'class': 'alert-message warning' }, 
            _('没有配置任何账号')));
        return;
    }

    // 账号状态表格
    var table = E('table', { 'class': 'table' }, [
        E('tr', { 'class': 'tr table-titles' }, [
            E('th', { 'class': 'th' }, _('接口')),
            E('th', { 'class': 'th' }, _('账号')),
            E('th', { 'class': 'th' }, _('IP地址')),
            E('th', { 'class': 'th' }, _('在线时间')),
            E('th', { 'class': 'th' }, _('使用流量'))
        ])
    ]);

    accounts.forEach(function(acc) {
        var row = E('tr', { 'class': 'tr' }, [
            E('td', { 'class': 'td' }, acc.interface || 'N/A'),
            E('td', { 'class': 'td' }, [
                E('img', { 
                    'src': '/luci-static/resources/icons/loading.gif',
                    'style': 'width:16px;height:16px'
                })
            ]),
            E('td', { 'class': 'td' }, '加载中...'),
            E('td', { 'class': 'td' }, '加载中...'),
            E('td', { 'class': 'td' }, '加载中...')
        ]);
        table.appendChild(row);

        callGetStatus(acc.interface).then(function(result) {
            row.childNodes[1].textContent = result?.uid || 'N/A';
            row.childNodes[2].textContent = result?.v4ip || 'N/A';
            row.childNodes[3].textContent = result?.time || 'N/A';
            row.childNodes[4].textContent = result?.flow || 'N/A';
        }).catch(function(e) {
            row.childNodes[1].textContent = '错误';
            row.childNodes[2].textContent = 'N/A';
            row.childNodes[3].textContent = 'N/A';
            row.childNodes[4].textContent = 'N/A';
        });
    });

    container.appendChild(table);
    container.appendChild(E('div', { 'class': 'cbi-section-description' }, 
        _('最后更新: ') + new Date().toLocaleString()));
}

return view.extend({
    load: function() {
        return Promise.all([
            uci.load('cquauth'),
            L.resolveDefault(fs.list('/sys/class/net'), [])
        ]);
    },

    render: function(data) {
        var m, s, o;
        var interfaces = data[1].map(function(entry) { 
            return entry.name; 
        }).filter(function(iface) {
            return iface.match(/^eth/) || iface.match(/^wlan/);
        });

        m = new form.Map('cquauth', _('CQU Auth Client'), _('非官方重庆大学网络认证客户端'));

        // ================= 状态显示部分 =================
        s = m.section(form.NamedSection, '_status', 'status');
        s.title = _('状态');
        s.anonymous = true;
        s.render = function() {
            var container = E('div', { 'class': 'cbi-section' });

            var accounts = [];
            uci.sections('cquauth', 'account', function(s) {
                if (s.interface) {
                    accounts.push({
                        user: s.user,
                        interface: s.interface
                    });
                }
            });

            // renderStatus(container, accounts);

            if (!pollAdded) {
                poll.add(function() {
                    var currentAccounts = [];
                    uci.sections('cquauth', 'account', function(s) {
                        if (s.interface) {
                            currentAccounts.push({
                                user: s.user,
                                interface: s.interface
                            });
                        }
                    });
                    
                    renderStatus(container, currentAccounts);
                }, 5); 
                pollAdded = true;
            }
            
            return container;
        };

        // ================= 配置表单部分 =================
        s = m.section(form.TypedSection, 'basic', _('基本设置'));
        s.anonymous = true;
        s.addremove = false;

        o = s.option(form.Flag, 'enabled', _('启用服务'));
        o.default = '1';
        o.rmempty = false;

        s = m.section(form.TableSection, 'account', _('账号配置'));
        s.title = _('账号配置');
        s.anonymous = true;
        s.addremove = true;

        o = s.option(form.Flag, 'enabled', _('启用'));
        o.default = '0';
        o.rmempty = false;

        o = s.option(form.Value, 'user', _('用户名'));
        o.rmempty = false;

        o = s.option(form.Value, 'pass', _('密码'));
        o.password = true;
        o.rmempty = false;

        o = s.option(widgets.DeviceSelect, 'interface', _('网络接口'));
        o.noaliases = true;
        o.nobridges = true;
        o.default = interfaces.length > 0 ? interfaces[0] : 'eth0';
        o.rmempty = false;

        o = s.option(form.Value, 'ua', _('User Agent'));
        o.default = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0';
        o.rmempty = false;

        o = s.option(form.ListValue, 'terminal_type', _('终端类型'));
        o.value('phone', _('手机'));
        o.value('pc', _('电脑'));
        o.default = 'pc';
        o.rmempty = false;

        return m.render();
    }
});