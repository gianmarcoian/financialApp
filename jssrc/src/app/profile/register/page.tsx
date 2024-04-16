'use strict'
'use client'

import React from 'react'
import { Credentials } from '@/components/credentials';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { BACKEND } from '@/scripts/config';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { POST } from '@/scripts/web';

export default function Home() {
  const router = useRouter();
  const userName = useSearchParams().get('username') ?? "";
  return (<Credentials leftButtonText='Login' rightButtonText='Register' registration={true} useModal={true} modalTitle='Register' username={userName} flipButtonPriority={true} onModalRegisterClicked={(n, nv, e, ev, p, pv) => onRegister(n, nv, e, ev, p, pv, router)} onModalLoginClicked={(n) => router.push(`./login?username=${n}`)} />)
}

function onRegister(name: string, name_verify: string, email: string, email_verify: string, password: string, password_verify: string, router: AppRouterInstance) {
  if (!isValidName(name)) {
    showError("User names must only contain letters and numbers.");
    return;
  }
  if (!isValidEmail(email)) {
    showError("Please enter a valid email address.");
    return;
  }
  if (!isValidPassword(password)) {
    showError("Please enter a password that meets the following requirements:\nAt least 8 characters long\nContains at least one number\nContains at least one symbol");
    return;
  }

  if (email !== email_verify) {
    showError("Email addresses do not match!");
    return;
  }
  if (name !== name_verify) {
    showError("User names do not match!");
    return;
  }
  if (password !== password_verify) {
    showError("Passwords do not match!");
    return;
  }

  const resource = "/profile/create";
  const payload = {
    username: name,
    email: email,
    password: password
  };

  const endpoint = `http://${BACKEND.ip}:${BACKEND.port}/profile/create`;

  // fetch(endpoint, {
  //   method: "POST",
  //   body: JSON.stringify(payload)
  // }).then(async resp => {
  POST(resource, payload).then(async resp => {
    if (resp.status === 404) {
      showError("Server returned 404");
    }
    else if (!resp.ok) {
      resp.json().then(data => {
        var msg = data?.error;
        if (msg === undefined || msg === null) {
          msg = "Unknown error";
        }
        showError(msg);
      }).catch(e => {
        showError("Unknown error");
      });
    }
    else {
      alert("Profile created successfully!");
      router.push(`./login?username=${name}&context=newprofile`)
    }
  }).catch(e => {
    showError(e);
  });
}

function isValidName(n: string) {
  const regexCode = '^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$';
  const regex = new RegExp(regexCode);
  return regex.test(n);
}

function isValidEmail(n: string) {
  const regexCode = '^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$';
  const regex = new RegExp(regexCode);
  return regex.test(n);
}

function isValidPassword(p: string) {
  if (p.length < 8) {
    return false;
  }
  const symbols: Array<string> = [
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    '-', '_', '=', '+', '[', ']', '{', '}', '\\', '|',
    ';', '\'', ':', '"', ',', '<', '.', '>', '/', '?',
    '`', '~'
  ];

  var containsNum = false;
  var containsSymbol = false;

  for (var i = 0; i < p.length; i++) {
    const c = p.charAt(i);
    if (c >= '0' && c <= '9') {
      containsNum = true;
    }

    if (symbols.includes(c)) {
      containsSymbol = true;
    }

    if (containsNum && containsSymbol) {
      break;
    }
  }

  return containsNum && containsSymbol;
}

function showError(msg: string) {
  // Can make this prettier later.
  alert(msg);
}