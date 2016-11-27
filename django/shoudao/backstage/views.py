from django.shortcuts import render
from django.http import HttpResponse,JsonResponse,HttpResponseBadRequest,HttpResponseForbidden
from django.contrib.auth.decorators import login_required,permission_required
from django.views.decorators.http import require_http_methods


@require_http_methods(['GET'])
@permission_required('is_superuser', raise_exception=False, login_url='/admin/login/')
def static(request):
    context={}
    return render(request,'static.html',context)