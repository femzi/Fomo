//
//  fomoApp.swift
//  fomo
//
//  Created by Mac on 30/06/2026.
//

import SwiftUI

@main
struct fomoApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: fomoDocument()) { file in
            ContentView(document: file.$document)
        }
    }
}
