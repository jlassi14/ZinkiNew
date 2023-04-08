/* eslint-disable prettier/prettier */

const UserRoute = require('./userRoute');
const SSMLRoute = require('./SSMLRoute');

module.exports=(app)=>{
	app.get('/',function(req,res){
		res.send({
			'message':'Our first endpoint'
		});
	});


	app.use('/User',UserRoute);
	app.use('/GenerateSSML',SSMLRoute);

}
