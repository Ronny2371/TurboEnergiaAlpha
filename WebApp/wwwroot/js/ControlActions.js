function ControlActions() {
	//Ruta base del API
	this.URL_API = "https://localhost:7190/api/";
	//this.URL_API = "https://turboenergia-api-arf6g0dkh7hrcudf.canadacentral-01.azurewebsites.net/api/";
	//this.URL_API = "https://cenfocinemas-dcordoba-axhnembvfrema9b7.eastus2-01.azurewebsites.net/api/"
	this.GetUrlApiService = function (service) {
		return this.URL_API + service;
	}
	//Devuelve el Id del usuario logueado (guardado en sessionStorage tras validar el OTP en el login), o 0 si no hay sesión
	this.GetUsuarioActualId = function () {
		var data = sessionStorage.getItem('usuarioActual');
		if (!data) return 0;
		try {
			var usuario = JSON.parse(data);
			return usuario.id || 0;
		} catch (e) {
			return 0;
		}
	}
	//Devuelve el objeto completo del usuario logueado, o null si no hay sesión
	this.GetUsuarioActual = function () {
		var data = sessionStorage.getItem('usuarioActual');
		if (!data) return null;
		try {
			return JSON.parse(data);
		} catch (e) {
			return null;
		}
	}
	//Devuelve el RolId del usuario logueado, o 0 si no hay sesión
	this.GetRolActual = function () {
		var usuario = this.GetUsuarioActual();
		if (!usuario || !usuario.rol) return 0;
		return usuario.rol.id || 0;
	}
	//Redirige segun el rol del usuario logueado
	this.RedirigirSegunRol = function () {
		var rolActual = this.GetRolActual();
		if (rolActual === 2) {
			window.location.href = "/PortalDistribuidor";
		} else {
			window.location.href = "/PanelAdministrador";
		}
	}
	//Guardia de pagina: si no hay sesion o el rol actual no esta en la lista
	//permitida para esta pagina, redirige. Se llama al inicio de cada pagina.
	//Ej: ca.VerificarAccesoPagina([1, 3]);
	this.VerificarAccesoPagina = function (rolesPermitidos) {
		var rolActual = this.GetRolActual();
		if (rolActual === 0) {
			window.location.href = "/Login";
			return false;
		}
		if (rolesPermitidos.indexOf(rolActual) === -1) {
			this.RedirigirSegunRol();
			return false;
		}
		return true;
	}
	//Oculta del sidebar los links que no le corresponden al rol actual.
	//Cada <a> del sidebar debe tener data-roles="1,3" (los RolId que SI pueden verlo).
	this.AplicarPermisosSidebar = function () {
		var rolActual = this.GetRolActual();
		$('.s-item[data-roles]').each(function () {
			var rolesPermitidos = $(this).data('roles').toString().split(',').map(Number);
			if (rolesPermitidos.indexOf(rolActual) === -1) {
				$(this).hide();
			}
		});
	}
	//Llena el nombre y rol del header con los datos reales del usuario logueado
	this.RellenarHeaderUsuario = function () {
		var usuario = this.GetUsuarioActual();
		if (!usuario) return;
		var nombreCompleto = usuario.nombre + ' ' + usuario.apellido1;
		var rolNombre = usuario.rol && usuario.rol.nombreRol ? usuario.rol.nombreRol : '';
		var iniciales = (usuario.nombre.charAt(0) + usuario.apellido1.charAt(0)).toUpperCase();
		$('.user-chip .user-name').text(nombreCompleto);
		$('.user-chip .user-role').text(rolNombre);
		$('.user-chip .avatar-circle').text(iniciales);
	}
	this.GetTableColumsDataName = function (tableId) {
		var val = $('#' + tableId).attr("ColumnsDataName");
		return val;
	}
	this.FillTable = function (service, tableId, refresh) {
		if (!refresh) {
			columns = this.GetTableColumsDataName(tableId).split(',');
			var arrayColumnsData = [];
			$.each(columns, function (index, value) {
				var obj = {};
				obj.data = value;
				arrayColumnsData.push(obj);
			});
			//Esto es la inicializacion de la tabla de data tables segun la documentacion de 
			// datatables.net, carga la data usando un request async al API
			$('#' + tableId).DataTable({
				"processing": true,
				"ajax": {
					"url": this.GetUrlApiService(service),
					dataSrc: ''
				},
				"columns": arrayColumnsData
			});
		} else {
			//RECARGA LA TABLA
			$('#' + tableId).DataTable().ajax.reload();
		}
	}
	this.GetSelectedRow = function () {
		var data = sessionStorage.getItem(tableId + '_selected');
		return data;
	};
	this.BindFields = function (formId, data) {
		console.log(data);
		$('#' + formId + ' *').filter(':input').each(function (input) {
			var columnDataName = $(this).attr("ColumnDataName");
			this.value = data[columnDataName];
		});
	}
	this.GetDataForm = function (formId) {
		var data = {};
		$('#' + formId + ' *').filter(':input').each(function (input) {
			var columnDataName = $(this).attr("ColumnDataName");
			data[columnDataName] = this.value;
		});
		console.log(data);
		return data;
	}
	/* ACCIONES VIA AJAX, O ACCIONES ASINCRONAS*/
	this.PostToAPI = function (service, data, callBackFunction) {
		$.ajax({
			type: "POST",
			url: this.GetUrlApiService(service),
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function (data) {
				if (callBackFunction) {
					Swal.fire(
						'Good job!',
						'Transaction completed!',
						'success'
					)
					callBackFunction(data);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var responseJson = jqXHR.responseJSON;
				var message = jqXHR.responseText;
				if (responseJson) {
					var errors = responseJson.errors;
					var errorMessages = Object.values(errors).flat();
					message = errorMessages.join("<br/> ");
				}
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					html: message,
					footer: 'UCenfotec'
				})
			}
		});
	};
	this.PutToAPI = function (service, data, callBackFunction) {
		var jqxhr = $.put(this.GetUrlApiService(service), data, function (response) {
			var ctrlActions = new ControlActions();
			Swal.fire(
				'Good job!',
				'Transaction completed!',
				'success'
			)
			if (callBackFunction) {
				callBackFunction(response);
			}
		})
			.fail(function (response) {
				var data = response.responseJSON;
				var errors = data.errors;
				var errorMessages = Object.values(errors).flat();
				message = errorMessages.join("<br/> ");
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					html: message,
					footer: 'UCenfotec'
				})
			})
	};
	this.DeleteToAPI = function (service, data, callBackFunction) {
		var jqxhr = $.delete(this.GetUrlApiService(service), data, function (response) {
			var ctrlActions = new ControlActions();
			Swal.fire(
				'Good job!',
				'Transaction completed!',
				'success'
			)
			if (callBackFunction) {
				callBackFunction(response);
			}
		})
			.fail(function (response) {
				var data = response.responseJSON;
				var errors = data.errors;
				var errorMessages = Object.values(errors).flat();
				message = errorMessages.join("<br/> ");
				Swal.fire({
					icon: 'error',
					title: 'Oops...',
					html: message,
					footer: 'UCenfotec'
				})
			})
	};
	this.GetToApi = function (service, callBackFunction) {
		var jqxhr = $.get(this.GetUrlApiService(service), function (response) {
			console.log("Response " + response);
			if (callBackFunction) {
				callBackFunction(response);
			}
		});
	}
}
//Custom jquery actions
$.put = function (url, data, callback) {
	if ($.isFunction(data)) {
		type = type || callback,
			callback = data,
			data = {}
	}
	return $.ajax({
		url: url,
		type: 'PUT',
		success: callback,
		data: JSON.stringify(data),
		contentType: 'application/json'
	});
}
$.delete = function (url, data, callback) {
	if ($.isFunction(data)) {
		type = type || callback,
			callback = data,
			data = {}
	}
	return $.ajax({
		url: url,
		type: 'DELETE',
		success: callback,
		data: JSON.stringify(data),
		contentType: 'application/json'
	});
}