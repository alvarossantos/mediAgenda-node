const express = require('express');
const path = require('path');
var conexao = require('./conexao');

const app = express();
const porta = 3000;

/*app.arguments(express.json());
app.arguments(express.static(path.join(
    __dirname, 'public'
)));*/
app.use(express.json());
app.use(express.static(path.join(
    __dirname, 'public'
)));

/*
const consultas = [
    {
        id: 1,
        paciente: 'Maria Souza',
        medico: 'Dr Fulano',
        especialidade: 'Cardiologia',
        data: '2026-05-12',
        horario: '09:00',
        status: 'confirmado'
    },
    {
        id: 2,
        paciente: 'Jao da Silva',
        medico: 'Dra Ciclana',
        especialidade: 'Dermatologia',
        data: '2026-05-12',
        horario: '10:30',
        status: 'pendente'
    },
    {
        id: 3,
        paciente: 'Ze Souza',
        medico: 'Dr Beltrano',
        especialidade: 'Ortopedia',
        data: '2026-05-13',
        horario: '14:00',
        status: 'confirmado'
    }
];
*/

// ===========================
//  ENDPOINTS DE AGENDAMENTOS 
// ===========================
app.get('/api/consultas', function(req, res){
    //res.json(consultas);
    var sql = "SELECT " +
                "id, paciente, medico, especialidade, data, horario, status " +
              "FROM vw_agendamentos " +
              "ORDER BY data,horario";
    conexao.query(sql, function(erro, resultados){
        if(erro){
            console.log('Erro ao buscar agendamentos:');
            console.log(erro);
            res.status(500).json({
                erro: true,
                mensagem: 'Erro ao buscar agendamentos'
            });
            return;
        }
        res.json(resultados);
    });
});

app.get('/api/status', function(req, res){
    res.json({
        sistema: 'MediAgenda Node',
        status: 'online',
        mensagem: 'Backend em NodeJS funcionando!'
    });
});

app.post('/api/agendamentos', function(req,res){
    var paciente         = req.body.paciente;
    var medico_id        = req.body.medico_id;
    var especialidade_id = req.body.especialidade_id;
    var data             = req.body.data;
    var horario          = req.body.horario;
    var status           = req.body.status;

    if(!paciente || !medico_id || !especialidade_id || !data || !horario || !status){
        res.status(400).json({
            erro: true,
            mensagem: 'Preencha todos os campos'
        });
        return;
    }
    var sql = "INSERT INTO agendamentos " +
               "(paciente, medico_id, especialidade_id, data, horario, status) " +
              "VALUES(?, ?, ?, ?, ?, ?)";
    var valores = [
        paciente, medico_id, especialidade_id, data, horario, status
    ];
    conexao.query(sql, valores, function(erro, resultado){
        if(erro){
            console.log('Erro ao cadastrar agendamento');
            console.log(erro);
            res.status(500).json({
                erro: true,
                mensagem: 'Erro ao cadastrar agendamento'
            });
            return;
        }
        res.status(201).json({
            erro: false,
            mensagem: 'Agendamento cadastrado com sucesso!',
            id: resultado.insertId
        });
    });

    /*
    Testar no terminal
    curl.exe -X POST "http://localhost:3000/api/agendamentos" -H "Content-type: application/json" -d "{\"paciente\":\"Jão Teste\",\"medico_id\":1,\"especialidade_id\":1,\"data\":\"2026-05-19\",\"horario\":\"09:45\",\"status\":\"Confirmado\"}"
    */

});

//listar apenas 1 agendamento
app.get('/api/agendamentos/:id', function(req, res){
    var id = req.params.id;
    var sql = "SELECT " +
                "id, paciente, medico, especialidade, data, horario, status " +
              "FROM vw_agendamentos " +
                "WHERE id = ?";
    conexao.query(sql, [id], function(erro, resultados){
        if(erro){
            console.log('Erro ao buscar agendamento:');
            console.log(erro);
            res.status(500).json({
                erro: true,
                mensagem: 'Erro ao buscar agendamento'
            });
            return;
        }
        if(resultados.length === 0){
            res.status(404).json({
                erro: true,
                mensagem: 'Agendamento não encontrado'
            });
            return;
        }
        res.json(resultados[0]);
    });
});

//atualizar um agendamento
app.put('/api/agendamentos/:id', function(req, res){
    var id               = req.params.id;
    var paciente         = req.body.paciente;
    var medico_id        = req.body.medico_id;
    var especialidade_id = req.body.especialidade_id;
    var data             = req.body.data;
    var horario          = req.body.horario;
    var status           = req.body.status;

    if(!paciente || !medico_id || !especialidade_id || !data || !horario || !status){
        res.status(400).json({
            erro: true,
            mensagem: 'Preencha todos os campos'
        });
        return;
    }
    var sql = "UPDATE agendamentos SET " +
              "paciente = ?, medico_id = ?, especialidade_id = ?, data = ?, horario = ?, status = ? " +
              "WHERE id = ?";
    var valores = [
        paciente, medico_id, especialidade_id, data, horario, status, id
    ];
    conexao.query(sql, valores, function(erro, resultado){
        if(erro){
            console.log('Erro ao atualizar agendamento');
            console.log(erro);
            res.status(500).json({
                erro: true,
                mensagem: 'Erro ao atualizar agendamento'
            });
            return;
        }
        res.json({
            erro: false,
            mensagem: 'Agendamento atualizado com sucesso!'
        });
    });
});

//deletar um agendamento
app.delete('/api/agendamentos/:id', function(req, res){
    var id = req.params.id;
    var sql = "DELETE FROM agendamentos WHERE id = ?";
    conexao.query(sql, [id], function(erro, resultado){
        if(erro){
            console.log('Erro ao deletar agendamento');
            console.log(erro);
            res.status(500).json({
                erro: true,
                mensagem: 'Erro ao deletar agendamento'
            });
            return;
        }
        res.json({
            erro: false,
            mensagem: 'Agendamento deletado com sucesso!'
        });
    });
});

//pesquisar agendamentos por filtros
app.get('/api/agendamentos/pesquisar/filtros', function(req, res){
    var sql = "SELECT " +
                "id, paciente, medico, especialidade, data, horario, status " +
                "FROM vw_agendamentos " +
                "WHERE id IN (SELECT id FROM agendamentos WHERE 1=1 ";
    var valores = [];
    if(req.query.paciente){
        sql += "AND paciente LIKE ? ";
        valores.push('%' + req.query.paciente + '%');
    }
    if(req.query.medico_id){
        sql += "AND medico_id = ? ";
        valores.push(req.query.medico_id);
    }
    if(req.query.especialidade_id){
        sql += "AND especialidade_id = ? ";
        valores.push(req.query.especialidade_id);
    }
    if(req.query.data_inicio && req.query.data_fim){
        sql += "AND data BETWEEN ? AND ? ";
        valores.push(req.query.data_inicio);
        valores.push(req.query.data_fim);
    }
    if(req.query.data_inicio && !req.query.data_fim){
        sql += "AND data >= ? ";
        valores.push(req.query.data_inicio);
    }
    if(!req.query.data_inicio && req.query.data_fim){
        sql += "AND data <= ? ";
        valores.push(req.query.data_fim);
    }
    sql += ") ORDER BY data, horario";
    console.log('SQL: ' + sql);

    conexao.query(sql, valores, function(erro, resultados){
        if(erro){
            console.log('Erro ao pesquisar agendamentos:');
            console.log(erro);
            res.status(500).json({
                erro: true,
                mensagem: 'Erro ao pesquisar agendamentos'
            });
            return;
        }
        res.json(resultados);
    });
});

// ===========================
//  ENDPOINTS DE MEDICOS
// ===========================
// 1. Listar todos os médicos
// Exemplo de teste no terminal:
// curl -X GET "http://localhost:3000/api/medicos"
// Postman GET URL: http://localhost:3000/api/medicos
app.get('/api/medicos', function(req, res) {
    var sql = "SELECT * FROM medicos ORDER BY nome";
    conexao.query(sql, function(erro, resultados){
        if(erro){
            console.log('Erro ao buscar medicos:', erro);
            console.log(erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao buscar medicos no banco de dados.'
            });
        }
        res.json(resultados);
    });
});

// 2. Buscar médico por ID
// Exemplo de teste no terminal (substitua o 1 pelo ID desejado):
// curl -X GET "http://localhost:3000/api/medicos/1"
// Postman GET URL: http://localhost:3000/api/medicos/1
app.get('/api/medicos/:id', function(req, res){
    var id = req.params.id;
    var sql = "SELECT * FROM medicos WHERE id = ?";
    conexao.query(sql, [id], function(erro, resultados){
        if(erro) {
            console.log('Erro ao buscar medico:', erro);
            console.log(erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao buscar medico no banco de dados.'
            });
        }

        if(resultados.length === 0) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Medico não encontrado.'
            });
        }
        res.json(resultados[0]);
    });
});

// 3. Criar novo médico
// Exemplo de teste no terminal:
// curl -X POST "http://localhost:3000/api/medicos" -H "Content-Type: application/json" -d 
// "{\"nome\":\"Dr. João Silva\",\"crm\":\"CRM-MG 12345\",\"especialidade_id\":1,\"telefone\":\"(35) 99999-9999\",
// \"email\":\"joao@clinica.com\",\"status\":\"Ativo\"}"
// Postman POST URL: http://localhost:3000/api/medicos
// {   
//      "nome": "Dr. João Silva",   
//      "crm": "CRM-MG 12345",   
//      "especialidade_id": 1,   
//      "telefone": "(35) 99999-9999",   
//      "email": "joao@clinica.com",   
//      "status": "Ativo" 
// }
app.post('/api/medicos', function(req, res){
    var nome = req.body.nome;
    var crm = req.body.crm;
    var especialidade_id = req.body.especialidade_id;
    var telefone = req.body.telefone;
    var email = req.body.email;
    var status = req.body.status;

    if(!nome || !crm || !especialidade_id || !telefone || !email) {
        return res.status(400).json({
            erro: true,
            mensagem: 'Preencha todos os campos.'
        });
    }

    var sql = "INSERT INTO medicos (nome, crm, especialidade_id, telefone, email, status) VALUES (?, ?, ?, ?, ?, ?)";
    var valores = [nome, crm, especialidade_id, telefone, email, status];

    conexao.query(sql, valores, function(erro, resultado){
        if(erro){
            console.log('Erro ao cadastrar medico:', erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao cadastrar medico no banco de dados.'
            });
        }
        res.status(201).json({
            erro: false,
            mensagem: 'Medico cadastrado com sucesso!',
            id: resultado.insertId
        });
    });
});

// 4. Atualizar médico (Aceita atualização parcial)
// Exemplo de teste no terminal (atualizando apenas telefone e status do médico ID 1):
// curl -X PUT "http://localhost:3000/api/medicos/1" -H "Content-Type: application/json" -d "{\"telefone\":\"(35) 98888-7777\",\"status\":\"Inativo\"}"
// Postman PUT URL: http://localhost:3000/api/medicos/1
// {
//      "telefone": "(35) 98888-7777",
//      "status": "Inativo"
// }
app.put('/api/medicos/:id', function(req, res){
    var id = req.params.id;

    // Criamos arrays vazios para guardar os trechos de SQL e os valores correspondentes
    var campos = [];
    var valores = [];

    // Verificamos cada campo. Se ele foi enviado no body, adicionamos na lista
    if (req.body.nome !== undefined) {
        campos.push("nome = ?");
        valores.push(req.body.nome);
    }
    if (req.body.crm !== undefined) {
        campos.push("crm = ?");
        valores.push(req.body.crm);
    }
    if (req.body.especialidade_id !== undefined) {
        campos.push("especialidade_id = ?");
        valores.push(req.body.especialidade_id);
    }
    if (req.body.telefone !== undefined) {
        campos.push("telefone = ?");
        valores.push(req.body.telefone);
    }
    if (req.body.email !== undefined) {
        campos.push("email = ?");
        valores.push(req.body.email);
    }
    if (req.body.status !== undefined) {
        campos.push("status = ?");
        valores.push(req.body.status);
    }

    // Validação: Se o array estiver vazio, significa que o usuário não enviou nenhum dado para atualizar
    if (campos.length === 0) {
        return res.status(400).json({
            erro: true,
            mensagem: 'Nenhum campo válido foi informado para atualização.'
        });
    }

    var sql = "UPDATE medicos SET " + campos.join(", ") + " WHERE id = ?";
    valores.push(id); // Adiciona o ID no final do array para o "WHERE id = ?"

    conexao.query(sql, valores, function(erro, resultado){
        if(erro) {
            console.log('Erro ao atualizar medico:', erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao atualizar medico.'
            });
        }

        if(resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: true,
                mensagem: "Medico não encontrado."
            });
        }

        res.json({
            erro: false,
            mensagem: 'Medico updated com sucesso!'
        });
    });
});

// 5. Deletar médico por ID
// Exemplo de teste no terminal (substitua o 1 pelo ID desejado):
// curl -X DELETE "http://localhost:3000/api/medicos/1"
// Postman DELETE URL: http://localhost:3000/api/medicos/1
app.delete('/api/medicos/:id', function(req, res){
    var id = req.params.id;
    var sql = "DELETE FROM medicos WHERE id = ?";
    conexao.query(sql, [id], function(erro, resultado){
        if(erro) {
            console.log('Erro ao deletar medico:', erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao deletar medico.'
            });
        }

        if(resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Medico não encontrado.'
            });
        }
        res.json({
            erro: false,
            mensagem: 'Medico deletado com sucesso!'
        });
    });
});

// ===========================
//  ENDPOINTS DE ESPECIALIDADES
// ===========================
// 1. Listar todas as especialidades
// Exemplo de teste no terminal:
// curl -X GET "http://localhost:3000/api/especialidades"
// Postman GET URL: http://localhost:3000/api/especialidades
app.get('/api/especialidades', function(req, res){
    var sql = "SELECT * FROM especialidades ORDER BY nome";
    conexao.query(sql, function(erro, resultados){
        if(erro){
            console.log('Erro ao buscar especialidades:', erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao buscar especialidades.'
            });
        }
        res.json(resultados);
    });
});

// 2. Buscar especialidade por ID
// Exemplo de teste no terminal (substitua o 1 pelo ID desejado):
// curl -X GET "http://localhost:3000/api/especialidades/1"
// Postman GET URL: http://localhost:3000/api/especialidades/1
app.get('/api/especialidades/:id', function(req, res){
    var id = req.params.id;
    var sql = "SELECT * FROM especialidades WHERE id = ?";
    conexao.query(sql, [id], function(erro, resultados){
        if(erro) {
            console.log('Erro ao buscar especialidade:', erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao buscar especialidade.'
            });
        }

        if(resultados.length === 0) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Especialidade não encontrada.'
            });
        }
        res.json(resultados[0]);
    });
});

// 3. Criar especialidade
// Exemplo de teste no terminal:
// curl -X POST "http://localhost:3000/api/especialidades" -H "Content-Type: application/json" -d "{\"nome\":\"Neurologia\"}"
// Postman POST URL: http://localhost:3000/api/especialidades
// {
//      "nome": "Neurologia"
// }
app.post('/api/especialidades', function(req, res){
    var nome = req.body.nome;

    if(!nome) {
        return res.status(400).json({
            erro: true,
            mensagem: 'Preencha todos os campos.'
        });
    }

    var sql = "INSERT INTO especialidades (nome) VALUES (?)";
    var valores = [nome];
    conexao.query(sql, valores, function(erro, resultado){
        if(erro) {
            console.log('Erro ao criar especialidade:', erro);
            if(erro.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    erro: true,
                    mensagem: 'Esta especialidade já está cadastrada.'
                });
            }

            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao criar especialidade.'
            });
        }

        res.status(201).json({
            erro: false,
            mensagem: 'Especialidade criada com sucesso!',
            id: resultado.insertId
        });
    });
});

// 4. Atualizar especialidade
// Exemplo de teste no terminal (substitua o 1 pelo ID desejado):
// curl -X PUT "http://localhost:3000/api/especialidades/1" -H "Content-Type: application/json" -d "{\"nome\":\"Cardiologia\"}"
// Postman PUT URL: http://localhost:3000/api/especialidades/1
// {
//      "nome": "Cardiologia"
// }
app.put('/api/especialidades/:id', function(req, res){
    var id = req.params.id;
    var nome = req.body.nome;

    if(!nome) {
        return res.status(400).json({
            erro: true,
            mensagem: 'Preencha todos os campos.'
        });
    }

    var sql = "UPDATE especialidades SET nome = ? WHERE id = ?";
    var valores = [nome, id];
    conexao.query(sql, valores, function(erro, resultado){
        if(erro) {
            console.log('Erro ao atualizar especialidade:', erro);
            return res.status(500).json({
                erro: true,
                mensagem: 'Erro ao atualizar especialidade.'
            });
        }

        if(resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: true,
                mensagem: 'Especialidade não encontrada.'
            });
        }
        res.json({
            erro: false,
            mensagem: 'Especialidade atualizada com sucesso!'
        });
    });
});

// 5. Excluir especialidade
// Exemplo de teste no terminal (substitua o 1 pelo ID desejado):
// curl -X DELETE "http://localhost:3000/api/especialidades/1"
// Postman DELETE URL: http://localhost:3000/api/especialidades/1
app.delete('/api/especialidades/:id', function(req, res){
    var id = req.params.id;
    var sql = "DELETE FROM especialidades WHERE id = ?";
    conexao.query(sql, [id], function(erro, resultado){
        if(erro) {
            console.log('Erro ao excluir especialidade:', erro);
            if(erro.code === 'ER_ROW_IS_REFERENCED_2' || erro.code === 'ER_ROW_IS_REFERENCED') {
                return res.status(400).json({
                    erro: true,
                    mensagem: 'Não é possível excluir esta especialidade pois existem médicos vinculados a ela.'
                });
            }
            return res.status(500).json({
                    erro: true,
                    mensagem: 'Erro ao excluir especialidade.'
            });
        }

        if(resultado.affectedRows === 0) {
            return res.status(404).json({
                    erro: true,
                    mensagem: 'Especialidade não encontrada.'
            });
        }
        res.json({
            erro: false,
            mensagem: 'Especialidade excluída com sucesso!'
        });
    });
});

app.listen(porta, function(){
    console.log('Servidor rodando em http://localhost:' + porta);
});