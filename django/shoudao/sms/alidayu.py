import hashlib
import json
import sys
from time import time, localtime, strftime
import requests
from django.conf import settings


# API_URL = 'http://gw.api.taobao.com/router/rest'
# settings.SMS['appkey'] = 你的APP_KEY
# settings.SMS['secret'] = 你的APP_SECRET
# PRODUCT = 'MyWebsite'  # 你的网站名称


def mixStr_py2(pstr):
    if (isinstance(pstr, str)):
        return pstr
    elif (isinstance(pstr, unicode)):
        return pstr.encode('utf-8')
    else:
        return str(pstr)


def calc_md5_sign(secret, parameters):
    keys = list(parameters.keys())
    keys.sort()
    parameters_str = "%s%s%s" % (secret, ''.join('%s%s' % (key, parameters[key]) for key in keys), secret)
    if sys.version_info >= (3, 0):
        parameters_str = parameters_str.encode(encoding='utf-8')
    else:
        parameters_str = mixStr_py2(parameters_str)  # py2 还要检测unicode
    return hashlib.md5(parameters_str).hexdigest().upper()


def send_sms(sms_param, phone_num=None, sms_free_sign_name=None, sms_template_code=None):
    sms_param = json.dumps(sms_param, ensure_ascii=False)
    timestamp = strftime("%Y-%m-%d %H:%M:%S", localtime(time()))  # 时间戳
    data = dict(app_key=settings.SMS['appkey'], format='json', method='alibaba.aliqin.fc.sms.num.send', rec_num=phone_num,
                sign_method='md5', sms_free_sign_name=sms_free_sign_name, sms_param=sms_param,
                sms_template_code=sms_template_code, sms_type='normal', timestamp=timestamp, v='2.0')
    data['sign'] = calc_md5_sign(settings.SMS['secret'], data)
    r = requests.post( 'http://gw.api.taobao.com/router/rest', data=data, headers={'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                                                   'User-Agent': 'curl/7.45.0'})
    return json.loads(r.text)


