import { Customer } from '../models/customer.js';

/**
 * True when the request has no verified identity (auth disabled/optional) or
 * when the signed-in Google account owns the given customer document.
 */
export async function ownscustomer(req, customerid) {
  if (!req?.auth) {
    return true;
  }

  const customer = await Customer.findById(String(customerid)).select('email').lean().exec();
  if (!customer) {
    // Unknown customer ids can only create their own record, never read others.
    return false;
  }

  return customer.email?.toLowerCase() === req.auth.email?.toLowerCase();
}
