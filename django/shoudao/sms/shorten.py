from urllib import request,parse
import json


def link(obj):
    # tpl_value = {'#operate#': '测试', '#code#': '1234'}

    url_long='http://shoudao.sparker.top/m/2jorfji211'
    params = parse.urlencode({'source':'3271760578','url_long':url_long})
    url = 'http://api.t.sina.com.cn/short_url/shorten.json?%s'%params
    try:
        req = request.urlopen(url)
        response = json.loads(req.read().decode('utf-8'))
        url_short=response[0]['url_short']
    except Exception as e: #忽略错误
        pass

    return url_short
    # is_success=response['error_code']==0
    # return is_success
