const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services/index');

const { createChannel, publishMessage } = require('../utils/messageQueue');
const { REMINDER_BINDING_KEY } = require('../config/serverConfig');

const bookingService = new BookingService();

class BookingController {

    constructor() {
    }

    async sendMessageToQueue(req, res){
        try {
            const channel = await createChannel();
            const data = {message: 'Success'};
            await publishMessage(channel, REMINDER_BINDING_KEY, JSON.stringify(data));
            return res.status(200).json({
                message: 'Successfully published the event'
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to publish message to queue',
                success: false,
                err: error.message,
                data: {}
            });
        }
    }

    async create (req, res) {
        try {
            const response = await bookingService.createBooking(req.body);
            console.log("FROM BOOKING CONTROLLER", response);
            return res.status(StatusCodes.OK).json({
                message: 'Successfully completed booking',
                success: true,
                err: {},
                data: response
            })
        } catch (error) {
            // Fallback to 500 if statusCode is not set (e.g. unexpected errors)
            const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
            return res.status(statusCode).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }
}

module.exports = BookingController