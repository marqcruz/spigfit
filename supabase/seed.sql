insert into public.exercises (name, muscle_group, instructions) values
('Supino reto com barra', 'Peitoral', 'Mantenha as escápulas retraídas e controle a descida.'),
('Supino inclinado com halteres', 'Peitoral', 'Evite aproximar excessivamente os halteres no topo.'),
('Crucifixo no cabo', 'Peitoral', 'Mantenha leve flexão dos cotovelos durante o movimento.'),
('Remada baixa', 'Costas', 'Puxe em direção ao abdômen sem projetar os ombros.'),
('Puxada frontal', 'Costas', 'Conduza a barra em direção à parte superior do peito.'),
('Agachamento livre', 'Pernas', 'Mantenha o tronco firme e os joelhos alinhados.'),
('Leg press 45°', 'Pernas', 'Não retire o quadril do encosto durante a descida.'),
('Cadeira extensora', 'Quadríceps', 'Controle a fase de retorno.'),
('Mesa flexora', 'Posterior de coxa', 'Evite elevar o quadril durante o movimento.'),
('Elevação lateral', 'Ombros', 'Eleve os braços sem encolher os ombros.'),
('Rosca direta', 'Bíceps', 'Mantenha os cotovelos próximos ao corpo.'),
('Tríceps corda', 'Tríceps', 'Estenda os cotovelos e afaste as pontas da corda no final.')
on conflict do nothing;
