#!/bin/sh
uwsgi --stop /tmp/yksx.pid
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic
uwsgi --ini uwsgi.ini