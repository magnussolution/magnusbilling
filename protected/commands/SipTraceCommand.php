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

            if (substr($args[0], 0, 3) != 'log') {
                $device = ' -d ' . $args[0];
            } else if ($args[0] == 'log') {
                define('DEBUG', 1);
            } elseif ($args[0] == 'logAll') {
                define('DEBUG', 2);
            }
        } else {
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
                $this->filter = $modelTrace->filter;
                echo 'Fond filter ' . $this->filter;
            } else {
                sleep(2);
                continue;
            }

            LinuxAccess::exec('pkill -f ngrep');
            echo $command = "ngrep -p  -W byline " . $modelTrace->filter . " -t port " . $modelTrace->port . $device . " >> " . $this->file_name;

            $output = $this->PsExecute($command, $modelTrace->timeout, $modelTrace->filter);
        }

    }

    public function PsExecute($command, $timeout = 58, $filter, $sleep = 2)
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
