"""
DEBIAN 11

sudo apt install wget build-essential libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev zlib1g-dev  

sudo apt install python3
sudo apt install python3.9-pip
python3.9 -m pip install python-binance


DEBIAN 10
sudo apt install wget build-essential libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev zlib1g-dev  
cd /tmp
wget https://www.python.org/ftp/python/3.9.1/Python-3.9.1.tgz
tar -xf Python-3.9.1.tgz
cd Python-3.9.1
make -j 2
sudo make altinstall

sudo python3.9 -m pip install --upgrade pip
sudo python3.9 -m pip install python-binance

CENTOS 7
yum install libffi-devel -y

curl -O https://www.python.org/ftp/python/3.9.1/Python-3.9.1.tgz
tar -xzf Python-3.9.1.tgz
cd Python-3.9.1 
./configure --enable-optimizations
make altinstall

python3.9 -m pip install --upgrade pip
pip3.9 install urllib3==1.26.6 
python3.9 -m pip install python-binance

python3.9 /var/www/html/mbilling/protected/commands/crypto.py 

"""
import sys
import getopt
from binance.client import Client
import json
from binance.client import Client
import json
client = Client(sys.argv[1], sys.argv[2])


res = client.get_deposit_history(coin=sys.argv[3],startTime=sys.argv[4]+'000')
print(json.dumps(res, indent=2))