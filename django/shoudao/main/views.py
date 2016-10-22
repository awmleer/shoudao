from django.shortcuts import render
from django.utils import timezone
import django.contrib.auth as auth #用户登录认证
from main.models import *
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required,permission_required
from django.http import HttpResponse,JsonResponse,HttpResponseBadRequest
import json
import sms.juhe
from sms import shorten
from django.conf import settings
import random,string


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



# todo user_info.name length limit



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
    if(data['title']==''):return HttpResponse('no title')
    if(len(data['title'])>12):return HttpResponse('标题过长(十二个字以内)')
    if(data['content']==''):return HttpResponse('no content')
    if (len(data['content']) > 2000): return HttpResponse('内容过长(两千个字以内)')
    if(len(data['contacts'])==0):return HttpResponse('请选择收件人')
    #todo title,sender,recipient中非法字符的检查

    if request.user.user_info.get_text_surplus()<len(data['contacts']):return HttpResponse('本月短信剩余量不足，请购买短信包或升级账户')

    recipients=[]
    message = Message(user=request.user, type=data['type'], title=data['title'],total_count=len(data['contacts']))
    data_notice = MessageDataNotice.objects.create(content=data['content'])
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
            send_success = sms.juhe.send_sms(contact['phone'], 22175,{'#recipient#': contact['name'], '#title#': data['title'],'#sender#': request.user.user_info.get().name + '。请点击链接确认收到:'+short_link+' '})
            # 【收道】#recipient#您好，您有一条通知:#title#，来自#sender#。
            # logger.info(result)
        recipients.append({'name':contact['name'],'phone':contact['phone'],'send_success':send_success,'reaction':False})
        if send_success: send_count+=1

    user_info=request.user.user_info.get()
    user_info.message_sent+=1
    user_info.text_sent+=send_count
    user_info.save()

    message.set_recipients(recipients)
    message.save()

    return HttpResponse('success')





@require_http_methods(['GET'])
@login_required
def message_all(request):
    messages=request.user.messages.all()
    res=[]
    for message in messages:
        if message.type=='notice':
            res.append({
                'message_id':message.id,
                'type':message.type,
                'title':message.title,
                'send_time':str(round(message.send_time.timestamp()*1000)),
                'total_count':message.total_count,
                'received_count':message.received_count
            })
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
        'recipients':message.get_recipients()
    }
    if message.type=='notice':
        res['content']=message.data_notice.content
    return JsonResponse(res)





@require_http_methods(['GET'])
@login_required
def account_info(request):
    user_info=request.user.user_info.get()
    res={
        'user_id':request.user.id,
        'name':user_info.name,
        'type':user_info.type,
        'message_sent':user_info.message_sent,
        'text_sent':user_info.text_sent,
        'text_limit':user_info.text_limit,
        'text_surplus':user_info.get_text_surplus()
    }
    return JsonResponse(res)

