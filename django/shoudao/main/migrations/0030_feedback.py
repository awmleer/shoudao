# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-23 08:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0029_redeemcode_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeedBack',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('contact_info', models.CharField(max_length=40)),
                ('message', models.CharField(max_length=1000)),
                ('score', models.PositiveIntegerField()),
            ],
        ),
    ]
