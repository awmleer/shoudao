# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-25 00:51
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0011_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='status',
            field=models.CharField(default='not_paid', max_length=10),
        ),
    ]
