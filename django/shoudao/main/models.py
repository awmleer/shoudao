from django.db import models
import json
from django.utils import timezone


class UserInfo(models.Model):
    user=models.ForeignKey('auth.User',on_delete=models.CASCADE,related_name='user_info')
    name = models.CharField(max_length=50, default='新用户')
    type = models.CharField(max_length=20, default='普通账户')
    expiration=models.DateField(null=True,blank=True)
    # avatar = models.ImageField(upload_to='avatars', default='avatar_default.png')
    message_sent=models.PositiveIntegerField(default=0)
    text_sent=models.PositiveIntegerField(default=0)
    text_surplus=models.PositiveIntegerField(default=0)
    # def get_text_surplus(self):
    #     return self.text_limit-self.text_sent


class ContactGroup(models.Model):
    user=models.ForeignKey('auth.User',on_delete=models.CASCADE,related_name='contact_groups')
    group_name=models.CharField(max_length=50, default='新用户')
    contacts=models.CharField(max_length=12000,default='[]')  #用json字符串存储的联系人列表
    def set_contacts(self, x):
        self.contacts = json.dumps(x)
    def get_contacts(self):
        return json.loads(self.contacts)



class Message(models.Model):
    user=models.ForeignKey('auth.User',related_name='messages')
    type=models.CharField(max_length=20)
    # type: notice notice_p
    title=models.CharField(max_length=50)
    send_time=models.DateTimeField(auto_now_add=True)
    total_count=models.PositiveIntegerField()
    received_count=models.PositiveIntegerField(default=0)
    comment_able=models.BooleanField(default=True)
    recipients=models.CharField(max_length=100000,default='[]')#普通通知能承受1k
    # for notice:
    # {
    #   "send_success": true,
    #   "phone": 18143465393,
    #   "name": "小明",
    #   "received":false,
    # }
    # for notice_p:
    # {
    #   "send_success": true,
    #   "phone": 18143465393,
    #   "name": "小明",
    #   "received":false,
    #   "reaction": ""
    # }
    def set_recipients(self, x):
        self.recipients = json.dumps(x)
    def get_recipients(self):
        return json.loads(self.recipients)
    data_notice=models.ForeignKey('MessageDataNotice')



class MessageDataNotice(models.Model):
    content=models.CharField(max_length=1000)
    comments=models.CharField(max_length=10000,default='[]')
    # comment:
    # {
    #   "phone": 18143465393,
    #   "name": "小明",
    #   "text": "some word",
    #   "time":""
    # }
    def set_comments(self, x):
        self.comments = json.dumps(x)
    def get_comments(self):
        return json.loads(self.comments)
    buttons=models.CharField(max_length=500,default='[]')
    # [{'button_name':''lorem'}]
    def set_buttons(self, x):
        self.buttons = json.dumps(x)
    def get_buttons(self):
        return json.loads(self.buttons)



class Link(models.Model):
    message=models.ForeignKey('Message',on_delete=models.CASCADE,related_name='links')
    recipient=models.CharField(max_length=30)
    token=models.CharField(max_length=20)
    short_link=models.CharField(max_length=30,default='')



class Order(models.Model):
    user=models.ForeignKey('auth.User',related_name='orders')
    item=models.CharField(max_length=20)
    amount=models.PositiveIntegerField()
    price=models.DecimalField(max_digits=20,decimal_places=2)
    total_fee=models.DecimalField(max_digits=20,decimal_places=2)
    status=models.CharField(max_length=10,default='not_paid')


class Item(models.Model):
    category=models.CharField(max_length=20)
    item_id=models.CharField(max_length=20)
    title=models.CharField(max_length=30)
    content=models.CharField(max_length=2000)
    can_buy=models.BooleanField(default=True)
    price=models.DecimalField(max_digits=20,decimal_places=2)
    footer=models.CharField(max_length=500)
    footer_style=models.CharField(max_length=30)
    # item_id:'account_standard',
    # title:'标准账户',
    # content:'这里是内容',
    # can_buy:true,
    # price:5,
    # footer:'￥5 /月<span class="float-right">现在购买</span>',
    # footer_style:'calm'


class RedeemCode(models.Model):
    code=models.CharField(max_length=30)
    item=models.CharField(max_length=20)
    used=models.BooleanField(default=False)



class Information(models.Model):
    key=models.CharField(max_length=20)
    value=models.CharField(max_length=50000)
    def set_value(self, x):
        self.value = json.dumps(x)
    def get_value(self):
        return json.loads(self.value)
