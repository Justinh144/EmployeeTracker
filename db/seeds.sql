INSERT INTO department(department_name)
VALUES("Domestic"), ("Foreign"), ("Online"), ("Black Water");

INSERT INTO role(title, salary, department_id)
VALUES("Agent", 90000, 1), ("Secret Agent", 115000, 2), ("Sleeper Agent", 400000, 3), ("00 Agent", 500000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Gary', 'Rotten', 1, 2), ('Carl', 'Smart', 1, null), ('Wang', 'Lu', 1, 2), ('Ronney', 'DeLong', 2, 2), ('Rodger', 'Bottom', 4, null);

