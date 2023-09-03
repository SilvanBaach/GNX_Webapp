/**
 * This class allows you to create a webhook in our WooCommerce store
 * @type {AxiosStatic | {AxiosResponseTransformer: AxiosResponseTransformer, AxiosRequestConfig: AxiosRequestConfig, AxiosResponseHeaders: RawAxiosResponseHeaders & AxiosHeaders, CanceledError: CanceledError, TransitionalOptions: TransitionalOptions, CancelTokenStatic: CancelTokenStatic, formToJSON(form: (GenericFormData | GenericHTMLFormElement)): object, HttpStatusCode: HttpStatusCode, FormSerializerOptions: FormSerializerOptions, Axios: Axios, all<T>(values: Array<Promise<T> | T>): Promise<T[]>, FormDataVisitorHelpers: FormDataVisitorHelpers, responseEncoding: "ascii" | "ASCII" | "ansi" | "ANSI" | "binary" | "BINARY" | "base64" | "BASE64" | "base64url" | "BASE64URL" | "hex" | "HEX" | "latin1" | "LATIN1" | "ucs-2" | "UCS-2" | "ucs2" | "UCS2" | "utf-8" | "UTF-8" | "utf8" | "UTF8" | "utf16le" | "UTF16LE", AxiosInterceptorOptions: AxiosInterceptorOptions, toFormData(sourceObj: object, targetFormData?: GenericFormData, options?: FormSerializerOptions): GenericFormData, Method: "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK", ResponseType: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream", AxiosHeaders: AxiosHeaders, AxiosProgressEvent: AxiosProgressEvent, AxiosStatic: AxiosStatic, SerializerOptions: SerializerOptions, AxiosRequestTransformer: AxiosRequestTransformer, GenericAbortSignal: GenericAbortSignal, RawAxiosResponseHeaders: RawAxiosResponseHeaders, isAxiosError<T=any, D=any>(payload: any): payload is AxiosError<T, D>, AxiosHeaderValue: AxiosHeaders | string | string[] | number | boolean, AxiosRequestHeaders: RawAxiosRequestHeaders & AxiosHeaders, ParamsSerializerOptions: ParamsSerializerOptions, Canceler: Canceler, Cancel: Cancel, AxiosResponse: AxiosResponse, AxiosProxyConfig: AxiosProxyConfig, RawAxiosRequestHeaders: RawAxiosRequestHeaders, AxiosInstance: AxiosInstance, CancelTokenSource: CancelTokenSource, SerializerVisitor: SerializerVisitor, GenericFormData: GenericFormData, CreateAxiosDefaults: CreateAxiosDefaults, GenericHTMLFormElement: GenericHTMLFormElement, CancelToken: CancelToken, isCancel(value: any): value is Cancel, AxiosDefaults: AxiosDefaults, AxiosPromise: Promise<AxiosResponse<T>>, spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R, RawAxiosRequestConfig: AxiosRequestConfig<D>, InternalAxiosRequestConfig: InternalAxiosRequestConfig, HeadersDefaults: HeadersDefaults, AxiosInterceptorManager: AxiosInterceptorManager, ParamEncoder: ParamEncoder, AxiosError: AxiosError, CustomParamsSerializer: CustomParamsSerializer, AxiosBasicCredentials: AxiosBasicCredentials, CancelStatic: CancelStatic, AxiosAdapter: AxiosAdapter, readonly default: AxiosStatic} | axios.AxiosStatic | axios}
 */
const axios = require('axios');

const consumerKey = process.env.WOOCOMMERECE_CONSUM_KEY;
const consumerSecret = process.env.WOOCOMMERECE_CONSUM_SECRET;
const hashSecret = process.env.WOOCOMMERECE_HASH_SECRET;

/**
 * This function creates a webhook in our WooCommerce store
 * It calls us back when an order is created
 */
function addCreateOrderWebhook(){

    const data = {
        name: 'Order Created',
        topic: 'order.created',
        delivery_url: 'https://webapp.teamgenetix.ch/wooCommerce/orderCreated',
        secret: hashSecret,
    };

    const config = {
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
        }
    };

    axios.post('https://store.teamgenetix.ch/wp-json/wc/v3/webhooks', data, config)
        .then((response) => {
            console.log('Webhook Created: ', response.data);
        })
        .catch((error) => {
            console.error('Error creating webhook: ', error);
        });
}

module.exports = {
    addCreateOrderWebhook
}