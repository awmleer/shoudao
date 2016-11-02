from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from main.models import *


class Command(BaseCommand):
    help = 'python manage.py create_redeem <item_id> <amount>'

    def add_arguments(self, parser):
        parser.add_argument('phone',type=str)
        parser.add_argument('name',type=str)
        # parser.add_argument(
        #     '--delete',
        #     action='store_true',
        #     dest='delete',
        #     default=False,
        #     help='Delete poll instead of closing it',
        # )

    def handle(self, *args, **options):
        user = User.objects.create_user(username=options['phone'],password=options['phone'])
        user.save()
        UserInfo.objects.create(user=user,name=options['name'],type='高级用户',expiration=timezone.now()+timedelta(days=30))
        self.stdout.write(self.style.SUCCESS('Successfully create user [%s]' % (options['phone'])))
