from django.shortcuts import render
from django.utils import timezone
import django.contrib.auth as auth #用户登录认证
from main.models import *
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required,permission_required
from django.http import HttpResponse,JsonResponse
import json
import sms.api
from django.conf import settings

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
    if(len(data['title'])>15):return HttpResponse('标题过长(十五个字以内)')
    if(data['content']==''):return HttpResponse('no content')
    result=sms.api.send_sms(sms_param={
        'recipient':'111',
        'sender':'hgb',
        'title':'hahahaha'
    },phone_num='18143465393',sms_free_sign_name='收道',sms_template_code='SMS_20255031')
    if result['alibaba_aliqin_fc_sms_num_send_response']['success']==True:
        res='success'
    else:
        res='发送失败'

    res = 'test'
    return HttpResponse(res)




