<?php
class SipTraceCommand extends CConsoleCommand
{
    public $config;
    public $success;
    private $filter;
    private $file_name = '/var/www/html/mbilling/resources/reports/siptrace.log';
    public function run($args)
    {
        $device = '';
        if (isset($args[0])) {
            if ($args[0] == 'log') {
                define('DEBUG', 1);
            } elseif ($args[0] == 'logAll') {
                define('DEBUG', 2);
            } else {
                $deviceName = (string) $args[0];
                if (! preg_match('/^[A-Za-z0-9_.:-]+$/', $deviceName)) {
                    Yii::log("Invalid SIPTrace device: " . $deviceName, 'error');
                    die("Invalid SIPTrace device");
                }
                $device = ' -d ' . escapeshellarg($deviceName);
            }
        }

        if ( ! defined('DEBUG')) {
            define('DEBUG', 0);
        }

        if ( ! defined('PID')) {
            define("PID", "/var/run/magnus/SipTracepid.php");
        }

        if (Process::isActive()) {
            echo " PROCESS IS ACTIVE ";
            Yii::log(" PROCESS IS ACTIVE ", 'error');
            die();
        } else {
            Process::activate();
        }

        while (1) {

            $modelTrace = SipTrace::model()->find();

            if (isset($modelTrace->id)) {
                $filter  = $this->sanitizeFilter($modelTrace->filter);
                $timeout = $this->sanitizeTimeout($modelTrace->timeout);
                $port    = $this->sanitizePort($modelTrace->port);

                if ($filter === false || $timeout === false || $port === false) {
                    Yii::log("Invalid SIPTrace request: id " . $modelTrace->id, 'error');
                    SipTrace::model()->deleteAll();
                    sleep(2);
                    continue;
                }

                $this->filter = $filter;
                echo 'Fond filter ' . $this->filter;
            } else {
                sleep(2);
                continue;
            }

            LinuxAccess::exec('pkill -f ngrep');
            echo $command = "ngrep -p -W byline " . escapeshellarg($filter) . " -t port " . $port . $device . " >> " . escapeshellarg($this->file_name);

            $output = $this->PsExecute($command, $timeout, $filter);
        }

    }

    private function sanitizeFilter($filter)
    {
        $filter = trim((string) $filter);
        if ($filter === '' || strlen($filter) > 50 || preg_match('/[\x00-\x1F\x7F]/', $filter)) {
            return false;
        }
        return $filter;
    }

    private function sanitizeTimeout($timeout)
    {
        $timeout = trim((string) $timeout);
        if ($timeout === '' || ! ctype_digit($timeout)) {
            return false;
        }
        $timeout = (int) $timeout;
        if ($timeout < 5 || $timeout > 300) {
            return false;
        }
        return $timeout;
    }

    private function sanitizePort($port)
    {
        $port = trim((string) $port);
        if ($port === '' || ! ctype_digit($port)) {
            return false;
        }
        $port = (int) $port;
        if ($port < 1 || $port > 65535) {
            return false;
        }
        return $port;
    }

    public function PsExecute($command, $timeout = 58, $filter = '', $sleep = 2)
    {
        // First, execute the process, get the process ID
        $pid = $this->PsExec($command);

        if ($pid === false) {
            return false;
        }

        $cur = 0;
        // Second, loop for $timeout seconds checking if process is running
        while ($cur < $timeout) {
            sleep($sleep);
            $cur += $sleep;
            // If process is no longer running, return true;
            echo "\n ---- $cur -- $pid ---- \n";

            if ($cur % 5 == 0) {
                $modelTrace = SipTrace::model()->find();
                if ( ! isset($modelTrace)) {
                    SipTrace::model()->deleteAll();
                    $this->PsKill($pid);
                    break;
                }
            }
            // Process must have exited, success!
        }

        SipTrace::model()->deleteAll();
        $this->PsKill($pid);
        return false;
    }

    public function PsExec($commandJob)
    {

        $command = $commandJob . ' 2>&1 & echo $!';

        $op = LinuxAccess::exec($command);

        $pid = (int) $op[0];

        if ($pid != "") {
            return $pid;
        }

        return false;
    }

    public function PsExists($pid)
    {

        $output = LinuxAccess::exec("ps ax | grep $pid|wc -l 2>&1");

        if ($output[0] > 0) {
            return true;
        }

        return false;
    }

    public function PsKill($pid)
    {
        echo "End process $pid";
        LinuxAccess::exec('pkill ngrep');
        try {
            posix_kill($pid, 2);
        } catch (Exception $e) {
            print_r($e);
        }
    }

}
