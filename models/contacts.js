const fs = require("fs/promises");
const path = require("path");
const contactsPath = path.join(__dirname, "contacts.json");
const { v4: uuidv4 } = require("uuid");
 
const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, "utf8");
    const contacts = JSON.parse(data);
    return contacts;
  } catch (error) {
    console.error(error);
    throw error;  
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((c) => c.id.toString() === contactId.toString());
    return contact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const addContact = async (body) => {
  try {
    const contacts = await listContacts();
    const { name, email, phone } = body;
    const aContact = [...contacts, { id: uuidv4(), name, email, phone }];
    await fs.writeFile(contactsPath, JSON.stringify(aContact));
    return aContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const indexContact = contacts.findIndex((c) => c.id.toString() === contactId.toString());

    if (indexContact !== -1) {
      contacts.splice(indexContact, 1);
      await fs.writeFile(contactsPath, JSON.stringify(contacts));
      return indexContact;  
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts();
    const indexContact = contacts.findIndex((c) => c.id.toString() === contactId.toString());

    if (indexContact !== -1) {
      contacts[indexContact] = { ...contacts[indexContact], ...body };
      await fs.writeFile(contactsPath, JSON.stringify(contacts));
    }
    return contacts[indexContact];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
