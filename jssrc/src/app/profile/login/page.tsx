'use strict'
'use client'

import React from 'react'
import { Credentials } from '@/components/credentials';
import { useRouter, useSearchParams } from 'next/navigation'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { POST, extractAuthFromHeader, addAuthQueryParams } from '@/scripts/web';

export default function Home() {
  const router = useRouter();
  const userName = useSearchParams().get('username') ?? "";
  const context = useSearchParams().get('context') ?? "";

  if (context == 'newprofile') {
    // In debug, each route is called twice for some reason. Avoid showing the alert twice by showing the notif
    // in the register page.. For now only, fix this for any kind of "real" release!

    //showSuccess("Profile created successfully!\nPlease login.");
  }

  return (<Credentials leftButtonText='Login' rightButtonText='Register' registration={false} useModal={true} username={userName} onModalLoginClicked={(n, p) => onLogin(n, p, router)} onModalRegisterClicked={(n) => router.push(`register?username=${n}`)} />)
}

function onLogin(name: string, password: string, router: AppRouterInstance) {
  const resource = "/profile/login";
  const payload = {
    username: name,
    password: password
  };

  POST(resource, payload).then(async resp => {
    if (resp.status === 404) {
      showError("Invalid login!");
    }
    else if (!resp.ok) {
      resp.json().then(data => {
        var msg = data?.error;
        if (msg === undefined || msg === null) {
          msg = "Unknown error";
        }
        showError(msg);
      }).catch(e => {
        console.error(e);
        showError("Unknown error");
      });
    }
    else {
      alert("Login successful!");
      extractAuthFromHeader(resp.headers);
      router.push("./" + addAuthQueryParams());
    }
  }).catch(e => {
    console.error(e);
    showError(e);
  });
}

function showError(msg: string) {
  alert(msg);
}

function showSuccess(msg: string) {
  alert(msg);
}