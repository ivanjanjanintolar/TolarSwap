import { toast } from 'react-toastify';

const ApiNotificationHandler = ({ getState, dispatch }) => next => action => {

    const { type, payload } = action;

    if (type.includes("FAIL")) {
        if (payload.toast_msg)
            toast.error(payload.toast_msg);
        console.error({
            message: payload ? payload.err_msg.errorType : undefined,
            description: payload ? payload.err_msg.detail : undefined,
        })

    } else if (type.includes("SUCCESS")) {
        if (payload.toast_msg)
            toast.success(payload.toast_msg);
    }
    next(action);
}
export default ApiNotificationHandler;