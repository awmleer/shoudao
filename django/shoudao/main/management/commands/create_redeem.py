from django.core.management.base import BaseCommand, CommandError
from main.models import RedeemCode
import random


class Command(BaseCommand):
    help = 'python manage.py create_redeem <item_id> <amount>'

    def add_arguments(self, parser):
        parser.add_argument('item_id',type=str)
        parser.add_argument('amount',type=int)
        # parser.add_argument(
        #     '--delete',
        #     action='store_true',
        #     dest='delete',
        #     default=False,
        #     help='Delete poll instead of closing it',
        # )

    def handle(self, *args, **options):
        count=0
        while count<options['amount']:
            code=''
            code += random.choice('123456789')
            code += random.choice('0123456789')
            code += random.choice('0123456789')
            code += random.choice('0123456789')
            code += random.choice('0123456789')
            code += random.choice('0123456789')
            code += random.choice('0123456789')
            code += random.choice('0123456789')
            codes=RedeemCode.objects.filter(code=code)
            if len(codes)>0: continue
            RedeemCode.objects.create(code=code,item=options['item_id'],type='new_user')
            count+=1
        self.stdout.write(self.style.SUCCESS('Successfully create %d redeem codes "%s"' % (count,options['item_id'])))
