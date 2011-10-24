<?php
	$json = array(
		array(
			"name" => "Mark McDonnell",
			"age" => 29, 
			"address" => "9 Cables Street, London"
		),
		array(
			"name" => "Joe Bloggs",
			"age" => 40, 
			"address" => "Bambridge Road, Essex"
		),
		array(
			"name" => "John Smith",
			"age" => 24, 
			"address" => "Meeson Mead, Leads"
		)
	);
	
	echo json_encode($json);
?>