import React, { useState } from "react";
import "./systemAdmin.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: "Tech Corp",
      email: "contact@techcorp.com",
      phone: "+1234567890",
      address: "123 Tech Street",
      status: "active",
      type: "company",
    },
    {
      id: 2,
      name: "Digital Solutions",
      email: "info@digitalsol.com",
      phone: "+1987654321",
      address: "456 Digital Ave",
      status: "active",
      type: "company",
    },
  ]);
  const [persons, setPersons] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1122334455",
      address: "789 Main St",
      status: "active",
      type: "person",
      subscription: "Premium",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1555666777",
      address: "321 Oak Road",
      status: "inactive",
      type: "person",
      subscription: "Basic",
    },
  ]);
  const [formData, setFormData] = useState({
    type: "company",
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    subscription: "Basic",
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatType, setActiveChatType] = useState(null);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");

  const handleAddEntity = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill all required fields");
      return;
    }
    const newEntity = {
      id:
        formData.type === "company" ? companies.length + 1 : persons.length + 1,
      ...formData,
    };
    if (formData.type === "company") {
      setCompanies([...companies, newEntity]);
    } else {
      setPersons([...persons, newEntity]);
    }
    setFormData({
      type: "company",
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      subscription: "Basic",
    });
    alert("Added successfully!");
  };

  const handleDelete = (id, type) => {
    if (window.confirm("Delete this item?")) {
      if (type === "company") {
        setCompanies(companies.filter((c) => c.id !== id));
      } else {
        setPersons(persons.filter((p) => p.id !== id));
      }
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !activeChatId) return;
    const chatKey = activeChatType + "-" + activeChatId;
    const newMsg = {
      id: Date.now(),
      sender: "admin",
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages({
      ...messages,
      [chatKey]: [...(messages[chatKey] || []), newMsg],
    });
    setCurrentMessage("");
  };

  const getFilteredData = () => {
    const allData = [...companies, ...persons];
    if (emailFilter === "all") return allData;
    if (emailFilter === "companies") return companies;
    if (emailFilter === "persons") return persons;
    if (emailFilter === "active")
      return allData.filter((i) => i.status === "active");
    if (emailFilter === "inactive")
      return allData.filter((i) => i.status === "inactive");
    return allData;
  };

  const renderDashboard = () => {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "dashboard-grid" },
        React.createElement(
          "div",
          { className: "stat-card" },
          React.createElement("div", { className: "stat-icon" }, "🏢"),
          React.createElement(
            "div",
            { className: "stat-number" },
            companies.length
          ),
          React.createElement(
            "div",
            { className: "stat-label" },
            "Total Companies"
          )
        ),
        React.createElement(
          "div",
          { className: "stat-card" },
          React.createElement("div", { className: "stat-icon" }, "✅"),
          React.createElement(
            "div",
            { className: "stat-number" },
            companies.filter((c) => c.status === "active").length
          ),
          React.createElement(
            "div",
            { className: "stat-label" },
            "Active Companies"
          )
        ),
        React.createElement(
          "div",
          { className: "stat-card" },
          React.createElement("div", { className: "stat-icon" }, "👤"),
          React.createElement(
            "div",
            { className: "stat-number" },
            persons.length
          ),
          React.createElement(
            "div",
            { className: "stat-label" },
            "Total Persons"
          )
        ),
        React.createElement(
          "div",
          { className: "stat-card" },
          React.createElement("div", { className: "stat-icon" }, "📊"),
          React.createElement(
            "div",
            { className: "stat-number" },
            persons.filter((p) => p.status === "active").length
          ),
          React.createElement(
            "div",
            { className: "stat-label" },
            "Active Subscriptions"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "card" },
        React.createElement(
          "h3",
          { className: "card-title" },
          "Companies Overview"
        ),
        React.createElement(
          "table",
          { className: "data-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Name"),
              React.createElement("th", null, "Email"),
              React.createElement("th", null, "Phone"),
              React.createElement("th", null, "Status")
            )
          ),
          React.createElement(
            "tbody",
            null,
            companies.map((c) =>
              React.createElement(
                "tr",
                { key: c.id },
                React.createElement("td", null, c.name),
                React.createElement("td", null, c.email),
                React.createElement("td", null, c.phone),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    { className: "badge badge-" + c.status },
                    c.status.toUpperCase()
                  )
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "card" },
        React.createElement(
          "h3",
          { className: "card-title" },
          "Persons & Subscriptions"
        ),
        React.createElement(
          "table",
          { className: "data-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Name"),
              React.createElement("th", null, "Email"),
              React.createElement("th", null, "Subscription"),
              React.createElement("th", null, "Status")
            )
          ),
          React.createElement(
            "tbody",
            null,
            persons.map((p) =>
              React.createElement(
                "tr",
                { key: p.id },
                React.createElement("td", null, p.name),
                React.createElement("td", null, p.email),
                React.createElement("td", null, p.subscription),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    { className: "badge badge-" + p.status },
                    p.status.toUpperCase()
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  const renderAddEntity = () => {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "card" },
        React.createElement(
          "h2",
          { className: "card-title" },
          "Add New Company or Person"
        ),
        React.createElement(
          "div",
          { className: "form-grid" },
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("label", null, "Type *"),
            React.createElement(
              "select",
              {
                value: formData.type,
                onChange: (e) =>
                  setFormData({ ...formData, type: e.target.value }),
              },
              React.createElement("option", { value: "company" }, "Company"),
              React.createElement("option", { value: "person" }, "Person")
            )
          ),
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("label", null, "Name *"),
            React.createElement("input", {
              type: "text",
              placeholder: "Name",
              value: formData.name,
              onChange: (e) =>
                setFormData({ ...formData, name: e.target.value }),
            })
          ),
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("label", null, "Email *"),
            React.createElement("input", {
              type: "email",
              placeholder: "Email",
              value: formData.email,
              onChange: (e) =>
                setFormData({ ...formData, email: e.target.value }),
            })
          ),
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("label", null, "Phone *"),
            React.createElement("input", {
              type: "tel",
              placeholder: "Phone",
              value: formData.phone,
              onChange: (e) =>
                setFormData({ ...formData, phone: e.target.value }),
            })
          ),
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("label", null, "Address"),
            React.createElement("input", {
              type: "text",
              placeholder: "Address",
              value: formData.address,
              onChange: (e) =>
                setFormData({ ...formData, address: e.target.value }),
            })
          ),
          React.createElement(
            "div",
            { className: "input-group" },
            React.createElement("label", null, "Status"),
            React.createElement(
              "select",
              {
                value: formData.status,
                onChange: (e) =>
                  setFormData({ ...formData, status: e.target.value }),
              },
              React.createElement("option", { value: "active" }, "Active"),
              React.createElement("option", { value: "inactive" }, "Inactive")
            )
          ),
          formData.type === "person" &&
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement("label", null, "Subscription"),
              React.createElement(
                "select",
                {
                  value: formData.subscription,
                  onChange: (e) =>
                    setFormData({ ...formData, subscription: e.target.value }),
                },
                React.createElement("option", { value: "Basic" }, "Basic"),
                React.createElement("option", { value: "Premium" }, "Premium"),
                React.createElement(
                  "option",
                  { value: "Enterprise" },
                  "Enterprise"
                )
              )
            )
        ),
        React.createElement(
          "button",
          { className: "btn-primary", onClick: handleAddEntity },
          "Add"
        )
      ),
      React.createElement(
        "div",
        { className: "card" },
        React.createElement("h3", { className: "card-title" }, "All Companies"),
        React.createElement(
          "table",
          { className: "data-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Name"),
              React.createElement("th", null, "Email"),
              React.createElement("th", null, "Phone"),
              React.createElement("th", null, "Status"),
              React.createElement("th", null, "Actions")
            )
          ),
          React.createElement(
            "tbody",
            null,
            companies.map((c) =>
              React.createElement(
                "tr",
                { key: c.id },
                React.createElement("td", null, c.name),
                React.createElement("td", null, c.email),
                React.createElement("td", null, c.phone),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    { className: "badge badge-" + c.status },
                    c.status.toUpperCase()
                  )
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "button",
                    {
                      className: "btn-danger",
                      onClick: () => handleDelete(c.id, "company"),
                    },
                    "Delete"
                  )
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "card" },
        React.createElement("h3", { className: "card-title" }, "All Persons"),
        React.createElement(
          "table",
          { className: "data-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Name"),
              React.createElement("th", null, "Email"),
              React.createElement("th", null, "Phone"),
              React.createElement("th", null, "Subscription"),
              React.createElement("th", null, "Status"),
              React.createElement("th", null, "Actions")
            )
          ),
          React.createElement(
            "tbody",
            null,
            persons.map((p) =>
              React.createElement(
                "tr",
                { key: p.id },
                React.createElement("td", null, p.name),
                React.createElement("td", null, p.email),
                React.createElement("td", null, p.phone),
                React.createElement("td", null, p.subscription),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    { className: "badge badge-" + p.status },
                    p.status.toUpperCase()
                  )
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "button",
                    {
                      className: "btn-danger",
                      onClick: () => handleDelete(p.id, "person"),
                    },
                    "Delete"
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  const renderChat = () => {
    const allContacts = [
      ...companies.map((c) => ({ ...c, displayType: "Company" })),
      ...persons.map((p) => ({ ...p, displayType: "Person" })),
    ];
    const activeContact = allContacts.find(
      (c) => c.id === activeChatId && c.type === activeChatType
    );
    const chatKey =
      activeChatId && activeChatType
        ? activeChatType + "-" + activeChatId
        : null;

    return React.createElement(
      "div",
      { className: "chat-layout" },
      React.createElement(
        "div",
        { className: "chat-sidebar" },
        React.createElement(
          "div",
          { className: "chat-sidebar-header" },
          "Contacts"
        ),
        allContacts.map((contact) =>
          React.createElement(
            "div",
            {
              key: contact.type + "-" + contact.id,
              className:
                activeChatId === contact.id && activeChatType === contact.type
                  ? "contact-item active"
                  : "contact-item",
              onClick: () => {
                setActiveChatId(contact.id);
                setActiveChatType(contact.type);
              },
            },
            React.createElement(
              "div",
              { className: "contact-name" },
              contact.name
            ),
            React.createElement(
              "div",
              { className: "contact-email" },
              contact.email
            ),
            React.createElement(
              "div",
              { className: "contact-type" },
              contact.displayType
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "chat-window" },
        activeContact
          ? React.createElement(
              "div",
              { className: "chat-content" },
              React.createElement(
                "h3",
                { className: "chat-header" },
                "Chat with " + activeContact.name
              ),
              React.createElement(
                "div",
                { className: "messages-area" },
                (messages[chatKey] || []).map((msg) =>
                  React.createElement(
                    "div",
                    {
                      key: msg.id,
                      className: "message message-" + msg.sender,
                    },
                    React.createElement("div", null, msg.text),
                    React.createElement(
                      "div",
                      { className: "message-time" },
                      msg.timestamp
                    )
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "chat-input-container" },
                React.createElement("input", {
                  type: "text",
                  className: "chat-input",
                  placeholder: "Type message...",
                  value: currentMessage,
                  onChange: (e) => setCurrentMessage(e.target.value),
                  onKeyPress: (e) => e.key === "Enter" && handleSendMessage(),
                }),
                React.createElement(
                  "button",
                  { className: "btn-primary", onClick: handleSendMessage },
                  "Send"
                )
              )
            )
          : React.createElement(
              "div",
              { className: "empty-state" },
              "Select a contact to start chatting"
            )
      )
    );
  };

  const renderEmailFilter = () => {
    const filtered = getFilteredData();
    return React.createElement(
      "div",
      { className: "card" },
      React.createElement("h2", { className: "card-title" }, "Email Filter"),
      React.createElement(
        "div",
        { className: "filter-section" },
        React.createElement(
          "select",
          {
            value: emailFilter,
            onChange: (e) => setEmailFilter(e.target.value),
          },
          React.createElement("option", { value: "all" }, "All"),
          React.createElement("option", { value: "companies" }, "Companies"),
          React.createElement("option", { value: "persons" }, "Persons"),
          React.createElement("option", { value: "active" }, "Active"),
          React.createElement("option", { value: "inactive" }, "Inactive")
        ),
        React.createElement(
          "button",
          {
            className: "btn-primary",
            onClick: () =>
              alert("Emails: " + filtered.map((u) => u.email).join(", ")),
          },
          "Copy Emails"
        )
      ),
      React.createElement(
        "table",
        { className: "data-table" },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "Name"),
            React.createElement("th", null, "Email"),
            React.createElement("th", null, "Type"),
            React.createElement("th", null, "Status")
          )
        ),
        React.createElement(
          "tbody",
          null,
          filtered.map((u) =>
            React.createElement(
              "tr",
              { key: u.type + "-" + u.id },
              React.createElement("td", null, u.name),
              React.createElement("td", null, u.email),
              React.createElement(
                "td",
                null,
                u.type === "company" ? "Company" : "Person"
              ),
              React.createElement(
                "td",
                null,
                React.createElement(
                  "span",
                  { className: "badge badge-" + u.status },
                  u.status.toUpperCase()
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "p",
        { className: "filter-total" },
        "Total: " + filtered.length
      )
    );
  };

  return React.createElement(
    "div",
    { className: "admin-container" },
    React.createElement(
      "div",
      { className: "header" },
      React.createElement(
        "h1",
        { className: "header-title" },
        "System Admin Dashboard"
      )
    ),
    React.createElement(
      "div",
      { className: "navigation" },
      React.createElement(
        "button",
        {
          className:
            activeTab === "dashboard" ? "nav-button active" : "nav-button",
          onClick: () => setActiveTab("dashboard"),
        },
        "Dashboard"
      ),
      React.createElement(
        "button",
        {
          className: activeTab === "add" ? "nav-button active" : "nav-button",
          onClick: () => setActiveTab("add"),
        },
        "Add Company/Person"
      ),
      React.createElement(
        "button",
        {
          className: activeTab === "chat" ? "nav-button active" : "nav-button",
          onClick: () => setActiveTab("chat"),
        },
        "Chat"
      ),
      React.createElement(
        "button",
        {
          className:
            activeTab === "filter" ? "nav-button active" : "nav-button",
          onClick: () => setActiveTab("filter"),
        },
        "Email Filter"
      )
    ),
    activeTab === "dashboard" && renderDashboard(),
    activeTab === "add" && renderAddEntity(),
    activeTab === "chat" && renderChat(),
    activeTab === "filter" && renderEmailFilter()
  );
};

export default AdminDashboard;
