from django.shortcuts import render
from django.utils import timezone
from datetime import datetime, timedelta
import django.contrib.auth as auth #用户登录认证
from django.contrib.auth.models import User
from main.models import *
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required,permission_required
from django.http import HttpResponse,JsonResponse,HttpResponseBadRequest,HttpResponseForbidden
import json
import sms.juhe
from sms import shorten
from django.conf import settings
import random,string
import  urllib.request,urllib.parse
import hashlib

import logging
logger = logging.getLogger('django')



@require_http_methods(["GET","POST"])
def login(request):
    data = json.loads(request.body.decode())
    user = auth.authenticate(username=data['phone'], password=data['password']) #电话号码当做username来用
    if user is not None:
        # the password verified for the user
        if user.is_active:
            # User is valid, active and authenticated
            auth.login(request, user)
            res = HttpResponse('success')
        else:
            # The password is valid, but the account has been disabled!
            res = HttpResponse('您的账号已被锁定')
    else:
        # the authentication system was unable to verify the username and password
        # The username and password were incorrect.
        res = HttpResponse('用户名或密码错误')
    return res




@require_http_methods(['POST'])
def signup(request):

    return res




@require_http_methods(['GET'])
def short_message_code(request):
    req = urllib.request.urlopen(url="https://captcha.luosimao.com/api/site_verify", data=urllib.parse.urlencode({"api_key": "57e4254c30b395edb9bc96da679e5a77", "response": request.GET['token']}).encode('utf-8'))
    response_dict = json.loads(req.read().decode('utf-8'))
    logger.info(response_dict)
    if response_dict['res'] == 'failed':
        return HttpResponse('wrong_token') #人机验证过期
    if len(User.objects.filter(username=request.GET['phone']))>0:
        return HttpResponse('该手机号已经注册过了')
    codes=ShortMessageCode.objects.filter(phone=request.GET['phone']).order_by('-create_time')
    if len(codes)>0:
        if timezone.now()<codes[0].create_time+timedelta(minutes=2):
            return HttpResponse('两分钟之内只能发送一次验证码')
    #在数据库中创建code记录
    new_code=str(random.randint(1000, 9999))
    ShortMessageCode.objects.create(phone=request.GET['phone'], code=new_code)
    #发送短信验证码
    send_success = sms.juhe.send_sms(request.GET['phone'], 14869, {
        '#code#': new_code})
    if send_success:
        return HttpResponse('success')
    else:
        return HttpResponse('发送失败')





@require_http_methods(['GET'])
def logout(request):
    auth.logout(request)
    return HttpResponse('success')





@login_required
def is_logged_in(request):
    # logger.info(request.user.user_info.get())
    return HttpResponse('success')






@require_http_methods(["GET"])
@login_required
def groups_all(request):
    # data = json.loads(request.body.decode())
    groups=request.user.contact_groups.all()
    res=[]
    for group in groups:
        res.append({
            'group_id':group.id,
            'group_name':group.group_name,
            'contacts':group.get_contacts()
        })
    logger.info(res)
    return JsonResponse(res,safe=False)




@require_http_methods(["POST"])
@login_required
def groups_new(request):
    data = json.loads(request.body.decode())
    if data['group_name']=='':
        return HttpResponse('分组名不能为空')
    if len(data['group_name'])>15:
        return HttpResponse('分组名过长(最多十五个字)')
    group=ContactGroup(group_name=data['group_name'],user=request.user)
    group.set_contacts(data['contacts'])
    # todo 每个分组中联系人数量上限
    group.save()
    return HttpResponse(group.id)




@require_http_methods(["GET"])
@login_required
def groups_delete(request):
    logger.info(request.GET)
    if request.GET['group_id']=='':
        return HttpResponse('请求参数错误')
    groups=ContactGroup.objects.filter(id=request.GET['group_id'])
    if len(groups)==0:
        return HttpResponse('分组不存在')
    if groups[0].user!=request.user:
        return HttpResponse('您没有权限该分组')
    groups[0].delete()
    return HttpResponse('success')



@require_http_methods(["POST"])
@login_required
def message_new(request):
    data = json.loads(request.body.decode())
    logger.info(data)
    if data['title']=='':return HttpResponse('no title')
    if len(data['title'])>12:return HttpResponse('标题过长(十二个字以内)')
    if data['content']=='':return HttpResponse('no content')
    if len(data['content'])>2000: return HttpResponse('内容过长(两千个字以内)')
    if len(data['contacts'])==0:return HttpResponse('请选择收件人')
    #todo title,sender,recipient中非法字符的检查
    if data['type']=='notice_p':
        if len(data['buttons'])==0: return HttpResponse('no buttons')
        if len(data['buttons'])>5: return HttpResponse('too many buttons')

    if request.user.user_info.get().text_surplus<len(data['contacts']):return HttpResponse('短信剩余量不足，请购买短信包或升级账户')

    recipients=[]
    message = Message(user=request.user, type=data['type'], title=data['title'],comment_able=data['comment_able'],total_count=len(data['contacts']))
    data_notice = MessageDataNotice(content=data['content'])
    if data['type']=='notice_p': data_notice.set_buttons(data['buttons'])
    data_notice.save()
    message.data_notice = data_notice
    message.save()

    # 开始发送短信
    send_count=0
    for contact in data['contacts']:
        token=''.join(random.sample(string.ascii_letters + string.digits, 8))
        link=Link.objects.create(message=message,recipient=contact['phone'],token=token)
        short_link=shorten.link({
            'message_id':message.id,
            'recipient':contact['phone'],
            'token':token
        })
        if short_link=='':#如果获取link失败
            send_success=False
        else:
            link.short_link=short_link
            link.save()
            send_success = sms.juhe.send_sms(contact['phone'], 22175,{'#recipient#': contact['name'][0:3] if len(contact['name'])>3 else contact['name'], '#title#': data['title'],'#sender#': request.user.user_info.get().name + '。请点击链接确认收到:'+short_link+' '})
            # 【收道】#recipient#您好，您有一条通知:#title#，来自#sender#。
            # logger.info(result)
        recipients.append({'name':contact['name'],'phone':contact['phone'],'send_success':send_success,'received':False})
        if send_success: send_count+=1

    user_info=request.user.user_info.get()
    user_info.message_sent+=1
    user_info.text_sent+=send_count
    user_info.text_surplus+=(-send_count)
    user_info.save()

    message.set_recipients(recipients)
    message.save()

    return HttpResponse('success')




@require_http_methods(['GET'])
@login_required
def message_remind_all(request):
    message=Message.objects.get(id=request.GET['message_id'])
    if message.user!=request.user:return HttpResponseForbidden()
    recipients=message.get_recipients()
    send_count=0
    for recipient in recipients:
        if not recipient['received']:
            link=message.links.get(recipient=recipient['phone'])
            send_success = sms.juhe.send_sms(recipient['phone'], 22175,{'#recipient#': recipient['name'], '#title#': message.title,'#sender#': request.user.user_info.get().name + '。请点击链接确认收到:' + link.short_link + ' '})
            if send_success: send_count += 1

    user_info=request.user.user_info.get()
    user_info.text_sent+=send_count
    user_info.text_surplus+=(-send_count)
    user_info.save()

    return HttpResponse('success')





@require_http_methods(['GET'])
@login_required
def message_all(request):
    messages=request.user.messages.all()
    res=[]
    for message in messages:
        obj = {
            'message_id': message.id,
            'type': message.type,
            'title': message.title,
            'send_time': str(round(message.send_time.timestamp() * 1000)),
            'total_count': message.total_count,
            'received_count': message.received_count
        }
        if message.type=='notice':
            res.append(obj)
        if message.type=='notice_p':
            res.append(obj)
    logger.info(res)
    return JsonResponse(res,safe=False)




@require_http_methods(['GET'])
@login_required
def message_detail(request):
    message_id=request.GET.get('message_id',default='')
    if message_id=='':
        return HttpResponseBadRequest()
    message=Message.objects.get(id=message_id)
    res={
        'message_id':message.id,
        'type':message.type,
        'title': message.title,
        'send_time': str(round(message.send_time.timestamp() * 1000)),
        'total_count':message.total_count,
        'received_count':message.received_count,
        'recipients':message.get_recipients(),
        'comment_able':message.comment_able,
        'content':message.data_notice.content
    }
    if message.comment_able:
        res['comments']=message.data_notice.get_comments()
    if message.type=='notice_p':
        res['buttons']=message.data_notice.get_buttons()
    return JsonResponse(res)




@require_http_methods(['POST'])
@login_required
def message_comment(request):
    data=json.loads(request.body.decode())
    message=Message.objects.get(id=data['message_id'])
    if message.user!=request.user: return HttpResponseForbidden()
    comments=message.data_notice.get_comments()
    comments.append({'phone': request.user.username, 'name': request.user.user_info.get().name, 'text': data['text'],'time': timezone.now().strftime('%Y-%m-%d %H:%M %a')})
    message.data_notice.set_comments(comments)
    message.data_notice.save()
    return HttpResponse('success')




@require_http_methods(['GET'])
@login_required
def account_info(request):
    user_info=request.user.user_info.get()
    res={
        'user_id':request.user.id,
        'name':user_info.name,
        'type':user_info.type,
        'expiration':user_info.expiration,
        'message_sent':user_info.message_sent,
        'text_sent':user_info.text_sent,
        'text_surplus':user_info.text_surplus
    }
    return JsonResponse(res)




@require_http_methods(['GET'])
@login_required
def change_name(request):
    new_name=request.GET['new_name']
    if new_name=='':return HttpResponse('名字不能为空')
    if len(new_name)>4:return HttpResponse('名字过长（4个字以内）')
    if '[' in new_name or ']' in new_name or '【' in new_name or '】' in new_name or '.' in new_name or '/' in new_name:return HttpResponse('名字中不能含有[ ] 【 】 . / 等特殊字符')
    user_info=request.user.user_info.get()
    user_info.name=new_name
    user_info.save()
    return HttpResponse('success')




@require_http_methods(['POST'])
@login_required
def change_password(request):
    data = json.loads(request.body.decode())
    new_password=data['new_password']
    if new_password=='':return HttpResponse('密码不能为空')
    if len(new_password)<8:return HttpResponse('密码长度过短')
    request.user.set_password(new_password)
    request.user.save()
    auth.logout(request)
    return HttpResponse('success')




@require_http_methods(['GET'])
@login_required
def items_filter(request,category):
    items=Item.objects.filter(category=category)
    res=[]
    for item in items:
        res.append({
            'category':item.category,
            'item_id':item.item_id,
            'title':item.title,
            'content':item.content,
            'can_buy':item.can_buy,
            'price':item.price,
            'footer':item.footer,
            'footer_style':item.footer_style
        })
    return JsonResponse(res,safe=False)




@require_http_methods(['POST'])
@login_required
def buy(request): #发起支付
    data=json.loads(request.body.decode())
    price=Item.objects.get(item_id=data['item']).price
    order=Order(user=request.user,item=data['item'],amount=data['amount'],price=price,total_fee=price*data['amount'])
    order.save()
    req_obj={'partner':settings.PASSPAY['pid'],'user_seller':settings.PASSPAY['seller'],'out_order_no':str(order.id),'subject':'收道','total_fee':str(price*data['amount']),'body':'收道 账户升级/短信包购买','notify_url':'http://shoudao.sparker.top/account/buy_done/','return_url':'http://www.sparker.top/pay_done.html'}
    logger.info(req_obj)
    m = hashlib.md5()
    m.update(('body='+req_obj['body']+'&notify_url='+req_obj['notify_url']+'&out_order_no='+req_obj['out_order_no']+'&partner='+req_obj['partner']+'&return_url='+req_obj['return_url']+'&subject='+req_obj['subject']+'&total_fee='+req_obj['total_fee']+'&user_seller='+req_obj['user_seller']+settings.PASSPAY['key']).encode('utf-8'))
    sign=m.hexdigest()
    logger.info(sign)
    req_obj['sign']=sign
    params = urllib.parse.urlencode(req_obj)
    res={
        'status':'success',
        'order_id':order.id,
        'url':"http://www.sparker.top/pay.html?%s"%params
    }
    return JsonResponse(res)



def buy_done(request): #云通付回调
    logger.info(request.method)
    if request.method=='POST':
        data=request.POST
    else:
        data=request.GET
    logger.info(data)
    m = hashlib.md5()
    # 顺序：out_order_no、total_fee、trade_status、云通付PID、云通付KEY
    m.update((data['out_order_no']+data['total_fee']+data['trade_status']+settings.PASSPAY['pid']+settings.PASSPAY['key']).encode('utf-8'))
    sign=m.hexdigest()
    if sign!=data['sign']: #签名异常
        return HttpResponseForbidden()

    order=Order.objects.get(id=data['out_order_no'])
    if data['trade_status']!='TRADE_SUCCESS': #如果支付没有成功
        order.status=data['trade_status']
        order.save()
        return HttpResponse('get')

    order.status='paid'
    order.save()
    #todo
    item_handle(order.user,order.item)
    return HttpResponse('success')


def redeem(request,code):
    redeem_codes=RedeemCode.objects.filter(code=code)
    if len(redeem_codes)==0:return HttpResponse('兑换码无效，请检查是否输错')
    redeem_code=redeem_codes[0]
    if redeem_code.used:return HttpResponse('该兑换码已经使用过了')
    item_handle(request.user,redeem_code.item)
    redeem_code.used=True
    redeem_code.who_used=request.user
    redeem_code.save()

    return HttpResponse('success')


def item_handle(user,item):
    user_info = user.user_info.get()
    # if item=='account_standard':
    #     if user_info.type=='免费账户': #新购
    #         user_info.type='标准账户'
    #         user_info.expiration=timezone.now()+timedelta(days=30)
    #     else: #续费
    #         user_info.expiration+=timedelta(days=30)
    #     user_info.save()
    if item=='account_advance':
        if user_info.type=='免费账户': #新购
            user_info.type='高级账户'
            user_info.expiration=timezone.now()+timedelta(days=30)
        else: #续费
            user_info.expiration+=timedelta(days=30)
    if item=='pack_10':user_info.text_surplus+=10
    if item=='pack_50':user_info.text_surplus+=50
    if item=='pack_100':user_info.text_surplus+=100
    if item=='pack_300':user_info.text_surplus+=300

    user_info.save()



@require_http_methods(['GET'])
@login_required
def buy_done_check(request): #用户自查订单是否支付成功
    order=Order.objects.get(id=request.GET['order_id'])
    if order.user!=request.user:
        return HttpResponseForbidden()
    else:
        if order.status=='paid':
            return HttpResponse('success')
        else:
            return HttpResponse('fail')





@require_http_methods(['POST'])
def m_preview(request):
    data=json.loads(request.body.decode())
    context={
        'preview':True,
        'message':{
            'title':data['title'],
            'user':request.user,
            'send_time':timezone.now(),
            'total_count': len(data['contacts']),
            'received_count': 0,
            'type':data['type'],
            'data_notice':{'content':data['content']},
            'comment_able':data['comment_able']
        },
        'comments':[],
        # 'buttons':[{'button_name':'aaa'}],
        'buttons':data['buttons'] if data['type']=='notice_p' else [],
        'recipient':'18812345678',
        'receive_percent':0,
        'i_received':False,
        'i_reaction':''
    }
    return render(request,'m.html',context)




@require_http_methods(['GET'])
def m(request,message_id,recipient,token):
    logger.info(message_id)
    message=Message.objects.get(id=message_id)
    link=message.links.get(recipient=recipient)
    if link.token!=token:return HttpResponseForbidden() #403
    recipients=message.get_recipients()
    i_received=False
    i_reaction=''
    for r in recipients:
        if str(r['phone'])==str(recipient):
            i_received=r['received']
            if i_received and message.type=='notice_p':i_reaction=r['reaction']
            break
    context={
        'preview':False,
        'message':message,
        'comments':message.data_notice.get_comments(),
        'buttons':message.data_notice.get_buttons(),
        'recipient':recipient,
        'receive_percent':message.received_count/message.total_count*100,
        'i_received':i_received
    }
    if message.type=='notice_p':context['i_reaction']=i_reaction
    return render(request,'m.html',context)




@require_http_methods(['POST'])
def m_submit(request,message_id,recipient,token):
    message=Message.objects.get(id=message_id)
    link=message.links.get(recipient=recipient)
    if link.token!=token:return HttpResponseForbidden() #403

    if request.POST['type']=='confirm':
        if message.type=='notice':
            recipients = message.get_recipients()
            for r in recipients:
                if str(r['phone']) == str(recipient):
                    if r['received']: return HttpResponse('您已经确认过了')
                    r['received'] = True
                    break
            message.set_recipients(recipients)
            message.received_count += 1
            message.save()
            return HttpResponse('success')
        if message.type=='notice_p':
            recipients = message.get_recipients()
            for r in recipients:
                if str(r['phone']) == str(recipient):
                    r['reaction']=request.POST['choice']
                    if not r['received']: #如果是之前还没有提交过
                        r['received']=True
                        message.received_count += 1
                    break
            message.set_recipients(recipients)
            message.save()
            return HttpResponse('success')


    if request.POST['type']=='comment':
        if not message.comment_able:return HttpResponseForbidden()
        text=request.POST['text']
        if text=='': return HttpResponse('评论内容不能为空')
        if len(text)>200:return HttpResponse('评论内容过长')
        recipients = message.get_recipients()
        for r in recipients:
            if str(r['phone']) == str(recipient):
                commenter=r
        data_notice=message.data_notice
        comments=data_notice.get_comments()
        comments.append({'phone':commenter['phone'],'name':commenter['name'],'text':text,'time':datetime.now().strftime('%Y-%m-%d %H:%M %a')})
        data_notice.set_comments(comments)
        data_notice.save()
        return HttpResponse('success')




@require_http_methods(['GET'])
def get_information(request,key,type):
    info=Information.objects.get(key=key)
    if type=='json':
        res=JsonResponse(info.get_value())
    elif type=='text':
        res=HttpResponse(info.value)
    else:
        res=HttpResponse('error')
    return res




