//
//  ContentView.swift
//  fomo
//
//  Created by Mac on 30/06/2026.
//

import SwiftUI

struct ContentView: View {
    @Binding var document: fomoDocument

    var body: some View {
        TextEditor(text: $document.text)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(document: .constant(fomoDocument()))
    }
}
