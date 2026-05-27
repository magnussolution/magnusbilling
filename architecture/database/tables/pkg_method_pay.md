# pkg_method_pay

| Column | Definition |
|---|---|
| `id` | int(11) NOT NULL AUTO_INCREMENT |
| `id_user` | int(11) NOT NULL |
| `payment_method` | char(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `show_name` | varchar(100) NOT NULL |
| `country` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `active` | tinyint(11) NOT NULL DEFAULT '0' |
| `active_agent` | tinyint(11) NOT NULL DEFAULT '0' |
| `obs` | varchar(300) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL |
| `url` | varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `username` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `pagseguro_TOKEN` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `fee` | tinyint(1) NOT NULL DEFAULT '0' |
| `boleto_convenio` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_banco` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_agencia` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_conta_corrente` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_inicio_nosso_numeroa` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_carteira` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_taxa` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_instrucoes` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_nome_emp` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_end_emp` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_cidade_emp` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_estado_emp` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `boleto_cpf_emp` | varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL |
| `P2P_CustomerSiteID` | varchar(100) NOT NULL DEFAULT '' |
| `P2P_KeyID` | varchar(50) NOT NULL DEFAULT '' |
| `P2P_Passphrase` | varchar(50) NOT NULL DEFAULT '' |
| `P2P_RecipientKeyID` | varchar(100) NOT NULL DEFAULT '' |
| `P2P_tax_amount` | varchar(10) NOT NULL DEFAULT '0' |
| `client_id` | varchar(500) DEFAULT NULL |
| `client_secret` | varchar(500) DEFAULT NULL |
| `SLAppToken` | varchar(50) DEFAULT NULL |
| `SLAccessToken` | varchar(50) DEFAULT NULL |
| `SLSecret` | varchar(50) DEFAULT NULL |
| `SLIdProduto` | int(11) DEFAULT NULL |
| `SLvalidationtoken` | varchar(100) DEFAULT NULL |
| `min` | int(11) NOT NULL DEFAULT '10' |
| `max` | int(11) NOT NULL DEFAULT '10' |
| `showFields` | text CHARACTER SET utf8 COLLATE utf8_bin |
| PRIMARY | KEY (`id`) |
| KEY | `fk_pkg_user_pkg_method_pay` (`id_user`) |
| CONSTRAINT | `fk_pkg_user_pkg_method_pay` FOREIGN KEY (`id_user`) REFERENCES `pkg_user` (`id`) |
