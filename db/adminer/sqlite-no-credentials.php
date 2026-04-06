<?php

use function Adminer\lang;
use function Adminer\adminer;

class AdminerFCSqliteConnectionWithoutCredentials {
    function loginForm() {
        echo '<div class="error">'. lang('Warning: don\'t use it in a production environment!').'</div>';
        echo "<table cellspacing='0' class='layout'>\n";
        echo '<input type="hidden" name="auth[driver]" value="sqlite">';
        echo adminer()->loginFormField('db', '<tr><th>' . lang('Database') . '<td>',
             '<input name="auth[db]" value="' . htmlspecialchars($_GET["db"]) . '" autocapitalize="off">' . "\n");
        echo "</table>\n";
        echo "<p><input type='submit' value='" . lang('Login') . "'>\n";
        return true;
    }

    function login($login, $password) {
        return true;
    }
}

return new AdminerFCSqliteConnectionWithoutCredentials();
