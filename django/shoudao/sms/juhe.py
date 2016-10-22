from urllib import request,parse
import json
from django.conf import settings


def send_sms(number,tpl_id,tpl_value):
    # tpl_value = {'#operate#': '测试', '#code#': '1234'}
    tpl_value_encoded = parse.urlencode(tpl_value)
    params = parse.urlencode({'mobile':number,'tpl_id':tpl_id,'tpl_value':tpl_value_encoded,'key': settings.SMS['key']})
    url = 'http://v.juhe.cn/sms/send?%s'%params
    req = request.urlopen(url)
    response = json.loads(req.read().decode('utf-8'))
    # response样例: {'error_code': 0, 'reason': '操作成功', 'result': {'count': 1, 'fee': 1, 'sid': '125321477102262424'}}
    # return response

    is_success=response['error_code']==0
    return is_success
