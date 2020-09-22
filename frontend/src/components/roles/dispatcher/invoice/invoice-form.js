import React, {useEffect, useState} from "react";
import FormikField from "../formik-field";
import {Formik, Form} from "formik";
import ItemList from "../item-list";
import ProductsTable from "../products/products-table";
import ProductDialog from "../products/product-dialog";
import {InvoiceFormValidation} from "./validation";
import {Button} from "@material-ui/core";
import {
    makeGetAllDriversRequest,
    makeSaveInvoiceRequest,
    makeUpdateInvoiceRequest,
    makeGetInvoiceByIdRequest,
} from "../request-utils";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";

const EMPTY_DRIVER = {
    name: "",
    surname: "",
    passport: "",
};

const EMPTY_PRODUCT_OWNER = {
    name: "",
    type: "SP",
    phone: "",
};

const EMPTY_PRODUCT = {
    id: -1,
    name: "",
    measure: "",
    mass: "",
    quantity: "",
    price: "",
};

const INIT_INVOICE_STATE = {
    number: "",
    shipper: "",
    consignee: "",
    registrationDate: "",
    driver: EMPTY_DRIVER,
    productOwner: EMPTY_PRODUCT_OWNER,
    products: [],
};

export default function InvoiceForm(props) {
    const [initInvoice, setInitInvoice] = useState(INIT_INVOICE_STATE);
    const [drivers, setDrivers] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(EMPTY_PRODUCT);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [productIndex, setProductIndex] = useState(0);

    const updateDriversList = async () => {
        try {
            const res = await makeGetAllDriversRequest();
            setDrivers(res.data);
        } catch (error) {
            setDrivers([]);
            handleRequestError(error);
        }
    };

    const sendInvoiceForSave = async (invoice) => {
        try {
            makeSaveInvoiceRequest(invoice);
        } catch (error) {
            handleRequestError(error);
        }
    };

    const sendInvoiceForUpdate = async (invoice) => {
        try {
            makeUpdateInvoiceRequest(invoice);
        } catch (error) {
            handleRequestError(error);
        }
    };

    const updateInitInvoiceState = async (id) => {
        try {
            const res = await makeGetInvoiceByIdRequest(id);
            setInitInvoice((prevState) => {
                return {
                    ...res.data,
                    productOwner: EMPTY_PRODUCT_OWNER,
                };
            });
        } catch (error) {
            setInitInvoice(INIT_INVOICE_STATE);
            handleRequestError(error);
        }
    };

    useEffect(() => {
        updateDriversList();
        if (props.invoiceId !== null && props.invoiceId !== undefined) {
            updateInitInvoiceState(props.invoiceId);
        } else {
            setInitInvoice((prevState) => {
                return {
                    ...prevState,
                    registrationDate: new Date().toISOString().slice(0, 10),
                    productOwner: props.productOwner,
                };
            });
        }
    }, [props.invoiceId, props.productOwner]);

    const handleProductDialogClose = () => {
        setSelectedProduct(EMPTY_PRODUCT);
        setProductDialogOpen(false);
    };

    const handleProductDelete = (id) => {
        if (id !== -1) {
            deleteProductById(id);
            handleProductDialogClose();
        }
    };

    const handleProductDialogSubmit = (product) => {
        if (product.id === -1) {
            addProduct(product);
        } else {
            updateProduct(product);
        }
        setSelectedProduct(EMPTY_PRODUCT);
        setProductDialogOpen(false);
    };

    const handleCreateNewProductClick = () => {
        setSelectedProduct(EMPTY_PRODUCT);
        setProductDialogOpen(true);
    };

    const handleProductTableClick = (product) => {
        setSelectedProduct(product);
        setProductDialogOpen(true);
    };

    const addProduct = (product) => {
        product.id = productIndex;
        setProductIndex(product.id + 1);
        setInitInvoice((prevState) => {
            const temp = [...prevState.products];
            temp.push(product);
            return {...prevState, products: temp};
        });
    };

    const updateProduct = (newProduct) => {
        setInitInvoice((prevState) => {
            const temp = [...prevState.products];
            for (let el of temp) {
                if (el.id === newProduct.id) {
                    el.name = newProduct.name;
                    el.measure = newProduct.measure;
                    el.mass = newProduct.mass;
                    el.quantity = newProduct.quantity;
                    el.price = newProduct.price;
                }
            }
            return {...prevState, products: temp};
        });
    };

    const deleteProductById = (id) => {
        setInitInvoice((prevState) => {
            const temp = [...prevState.products];
            for (let i = 0; i < temp.length; i++) {
                if (temp[i].id === id) {
                    temp.splice(i, 1);
                }
            }
            return {...prevState, products: temp};
        });
    };

    const handleRequestError = (error) => {
        console.log(error.response);
        if (error.response && error.response.status !== 500) {
            alert(error.response.data);
            // openToast(error.response.data, "error");
        } else {
            alert("Cannot get response from server");
            // openToast("Cannot get response from server", "error");
        }
    };

    const handleSubmit = (values) => {
        let invoice = {};
        invoice.invoiceNumber = values.invoiceNumber;
        invoice.shipper = values.shipper;
        invoice.consignee = values.consignee;

        invoice.productOwner = initInvoice.productOwner;
        invoice.products = initInvoice.products;
        invoice.registrationDate = initInvoice.registrationDate;
        invoice.driverId = initInvoice.driver.id;
        invoice.status = "REGISTERED";

        if (props.invoiceId !== null && props.invoiceId !== undefined) {
            invoice.id = props.invoiceId;
            sendInvoiceForUpdate(invoice);
        } else {
            sendInvoiceForSave(invoice);
        }
    };

    return (
        <React.Fragment>
            <Formik
                enableReinitialize
                initialValues={{
                    invoiceNumber: initInvoice.number,
                    shipper: initInvoice.shipper,
                    consignee: initInvoice.consignee,
                }}
                onSubmit={handleSubmit}
                validationSchema={InvoiceFormValidation}
            >
                {(formProps) => (
                    <Form>
                        <TextField
                            disabled={true}
                            id={"productOwnerName"}
                            label={"Product owner name"}
                            value={initInvoice.productOwner.name}
                        />
                        <TextField
                            disabled={true}
                            id="productOwnerType"
                            label="Product owner type"
                            value={initInvoice.productOwner.type}
                        />
                        <TextField
                            disabled={true}
                            id={"productOwnerPhone"}
                            label={"Product owner phone"}
                            value={initInvoice.productOwner.phone}
                        />
                        <TextField
                            disabled={true}
                            id={"invoiceRegistrationDate"}
                            label={"Invoice registration date"}
                            value={initInvoice.registrationDate}
                        />

                        <Grid container justify={"space-evenly"}>
                            <Grid item xs={4}
                                  justify="space-between"
                                  alignItems="center">
                                <FormikField
                                    formikProps={formProps}
                                    id={"invoiceNumber"}
                                    label={"Invoice number"}
                                    formikFieldName={"invoiceNumber"}
                                />

                                <FormikField
                                    formikProps={formProps}
                                    id={"shipper"}
                                    label={"Shipper"}
                                    formikFieldName={"shipper"}
                                />

                                <FormikField
                                    formikProps={formProps}
                                    id={"consignee"}
                                    label={"Consignee"}
                                    formikFieldName={"consignee"}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    disabled={true}
                                    id={"driverName"}
                                    label={"Driver name"}
                                    value={initInvoice.driver.name}
                                />
                                <TextField
                                    disabled={true}
                                    id={"driverSurname"}
                                    label={"Driver surname"}
                                    value={initInvoice.driver.surname}
                                />
                                <TextField
                                    disabled={true}
                                    id={"driverPassport"}
                                    label={"Driver passport"}
                                    value={initInvoice.driver.passport}
                                />
                                <ItemList
                                    items={drivers}
                                    onRowClick={(item) => {
                                        setInitInvoice((prevState) => {
                                            return {...prevState, driver: item};
                                        });
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Button variant="contained"
                                color="primary"
                                onClick={handleCreateNewProductClick}>
                            +
                        </Button>
                        <ProductsTable
                            products={initInvoice.products}
                            onRowClick={handleProductTableClick}
                        />

                        <ProductDialog
                            open={productDialogOpen}
                            initProductState={selectedProduct}
                            onSubmit={handleProductDialogSubmit}
                            onDelete={handleProductDelete}
                            onClose={handleProductDialogClose}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={formProps.listener}
                        >
                            Register invoice
                        </Button>
                    </Form>
                )}
            </Formik>
        </React.Fragment>
    );
};
