import React, {useEffect, useState} from "react";
import useToast from "../components/parts/toast-notification/useToast";
import {connect} from "react-redux";
import * as Stomp from "stompjs"
import useInvoiceConfirmationForm from "./hooks/forms/use-invoice-confirmation-form";
import useActionToast from "./hooks/action-toast/use-action-toast";
import useWaybillInfoForm from "./hooks/forms/use-waybill-info-form";
import useInvoiceEditForm from "./hooks/forms/use-invoice-edit-form";
import useNewInvoiceHandler from "./hooks/handlers/use-new-invoice-handler";
import usePointPass from "./hooks/handlers/use-point-pass-handler";
import usePointPassHandler from "./hooks/handlers/use-point-pass-handler";

const mapStateToProps = (store) => {
    return {
        userId: store.user.id,
        role: store.user.roles[0]
    }
};

export const WebSocket = connect(mapStateToProps)((props) => {
    const [currentStompClient, setCurrentStompClient] = useState(null);
    const [ToastComponent, showToast] = useToast();
    const [ActionToastComponent, openActionToast] = useActionToast()
    const [InvoiceConfirmationDialogComponent, openInvoiceConfirmationDialogComponent] = useInvoiceConfirmationForm();
    const [WaybillDialogComponent, openWaybillDialog] = useWaybillInfoForm();
    const [InvoiceEditDialogComponent, openEditInvoiceDialog] = useInvoiceEditForm();

    const [NewInvoiceHandlerComponent, handleNewInvoiceMessage] = useNewInvoiceHandler();
    const [PointPassHandlerComponent, handlePointPassMessage] = usePointPassHandler()

    const subscribeToPrivateUrl = (stompClient) => {
        const privateUrl = `/user/${props.userId}/queue/messages`
        stompClient.subscribe(privateUrl, onMessageReceive)
    }

    const onSocketConnect = (stompClient) => {
        showToast("Connected to real-time messaging")
        setCurrentStompClient(stompClient);
        subscribeToPrivateUrl(stompClient);
    }

    const onSocketError = () => {
        setCurrentStompClient(null);
        showToast("Cannot connect to real-time messaging", "warning")
    }

    const connectToServer = () => {
        let SockJs = require("sockjs-client");
        SockJs = new SockJs("http://localhost:8080/ws");
        return Stomp.over(SockJs);
    }

    const handleNewWaybillMessage = (messageData) => {
        openActionToast(
            `New waybill`,
            [""],
            () => openWaybillDialog(messageData.waybillId))
    }

    const handleInvoiceStatusUpdateMessage = (messageData) => {
        switch (messageData.newStatus) {
            case "REJECTED":
                openActionToast(
                    `Invoice was rejected`, [``],
                    () => openEditInvoiceDialog(messageData.invoiceId, showToast)
                )
                break;
            case "ACCEPTED":
                openActionToast(
                    `Invoice was accepted`, [``],
                    () => openInvoiceConfirmationDialogComponent(messageData.invoiceId));
                break;
            default:
                openActionToast(
                    `Invoice status updated`, [``],
                    () => openInvoiceConfirmationDialogComponent(messageData.invoiceId));
                break;
        }
    }

    const handleInvoiceUpdateMessage = (messageData) => {
        openActionToast(
            `Invoice was updated`, [``],
            () => openInvoiceConfirmationDialogComponent(messageData.invoiceId));
    }

    // const handlePointPass = (messageData) => {
    //     openActionToast(
    //         `Point pass`,
    //         [""],
    //         () => openWaybillDialog(messageData.waybillId))
    // }

    const onMessageReceive = (msg) => {
        const messageData = JSON.parse(msg.body);
        switch (messageData.notificationType) {
            case "NEW_INVOICE":
                handleNewInvoiceMessage(messageData, openActionToast);
                break;
            case "NEW_WAYBILL":
                handleNewWaybillMessage(messageData);
                break;
            case "INVOICE_STATUS_UPDATE":
                handleInvoiceStatusUpdateMessage(messageData);
                break;
            case "INVOICE_UPDATE":
                handleInvoiceUpdateMessage(messageData);
                break;
            case "POINT_PASS":
                handlePointPassMessage(messageData, openActionToast);
                break;
            default:
                showToast("Some notification has come");
        }
    }

    useEffect(() => {
        if (props.role !== 'UNKNOWN') {
            let stompClient = connectToServer();
            stompClient.connect({}, () => onSocketConnect(stompClient), () => onSocketError());
        } else {
            console.log("DROP CONNECTION")
        }
    }, [props.role])


    return (
        <div style={{zIndex: 999}}>
            {WaybillDialogComponent}
            {InvoiceConfirmationDialogComponent}
            {InvoiceEditDialogComponent}
            {ActionToastComponent}
            {ToastComponent}

            {NewInvoiceHandlerComponent}
            {PointPassHandlerComponent}
        </div>
    )
})