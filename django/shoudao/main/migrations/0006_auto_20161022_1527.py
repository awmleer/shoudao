# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-22 07:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_auto_20161022_0334'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='messagedatanotice',
            name='received',
        ),
        migrations.AlterField(
            model_name='message',
            name='recipients',
            field=models.CharField(default='[]', max_length=100000),
        ),
    ]