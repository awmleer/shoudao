from django.shortcuts import render
from django.http import HttpResponse,JsonResponse,HttpResponseBadRequest,HttpResponseForbidden
from django.contrib.auth.decorators import login_required,permission_required
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import datetime, timedelta
from main.models import *
import json

@require_http_methods(['GET'])
@permission_required('is_superuser', raise_exception=False, login_url='/admin/login/')
def static(request):
    i=7
    day=timezone.localtime(timezone.now()).date()
    labels=[]
    data=[]
    while i>0:
        data.insert(0,UserLog.objects.filter(time__date=day).filter(user__is_staff=False).count())
        labels.insert(0,day.strftime('%m-%d'))
        day-=timedelta(days=1)
        i-=1

    context={
        'labels':json.dumps(labels),
        'data':json.dumps(data)
    }
    return render(request,'static.html',context)